<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function reply(int $status, bool $ok, string $message): void {
    http_response_code($status);
    echo json_encode(['success' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    reply(405, false, 'Dopušten je samo POST zahtjev.');
}

// Reject malformed fields, overlong inputs, and header injection.
function field(string $key, int $maxLen): string {
    $value = $_POST[$key] ?? '';
    if (!is_string($value)) reply(422, false, 'Neispravni podaci obrasca.');
    $value = trim(strip_tags(str_replace("\0", '', $value)));
    if (strlen($value) > $maxLen * 4) reply(413, false, 'Uneseni tekst je predugačak.');
    return $value;
}

// Honeypot is not visible to normal users.
if (field('website', 300) !== '') reply(200, true, 'Hvala na upitu.');

$name = field('name', 120);
$emailRaw = field('email', 254);
$phone = field('phone', 50);
$service = field('service', 60);
$message = field('message', 5000);
$privacy = field('privacy', 1);
$email = filter_var($emailRaw, FILTER_VALIDATE_EMAIL);

$allowedServices = [
    'Opći upit','Audatex podrška','Audatex prodaja','AUTOonline','Lectura',
    'Procjena vrijednosti','Procjena štete','PDR popravak','Analize i vještačenja',
    'Savjetovanje','Scain','Ostalo'
];
if ($name === '' || strlen($name) < 2 || !$email || $message === '' ||
    $privacy !== '1' || !in_array($service, $allowedServices, true)) {
    reply(422, false, 'Molimo ispravno ispunite sva obavezna polja.');
}
if (preg_match('/[\r\n]/', $name . $phone . $service . $emailRaw)) {
    reply(422, false, 'Neispravni podaci obrasca.');
}

// This basic per-session throttle reduces accidental repeat submissions.
if (session_status() === PHP_SESSION_NONE) {
    session_start(['cookie_httponly' => true, 'cookie_samesite' => 'Lax',
        'cookie_secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')]);
}
if (isset($_SESSION['last_message_at']) && time() - (int)$_SESSION['last_message_at'] < 20) {
    reply(429, false, 'Upit je nedavno poslan. Pokušajte ponovno malo kasnije.');
}

$to = 'info@mobile-ekspert.net';
$subject = 'Novi web upit: ' . $service;
$body = "Ime i prezime: {$name}\nE-mail: {$email}\nTelefon: {$phone}\nVrsta upita: {$service}\n\nPoruka:\n{$message}\n";
$body = preg_replace("/\r?\n/", "\r\n", $body);
$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: Mobile Ekspert web <info@mobile-ekspert.net>',
    'Reply-To: ' . $email
];
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

if (!mail($to, $encodedSubject, $body, implode("\r\n", $headers))) {
    error_log('[Mobile Ekspert] Kontakt forma: PHP mail() nije prihvatio slanje.');
    reply(503, false, 'Slanje trenutačno nije dostupno. Molimo javite se na info@mobile-ekspert.net.');
}
$_SESSION['last_message_at'] = time();
reply(200, true, 'Hvala! Vaš je upit uspješno poslan.');
