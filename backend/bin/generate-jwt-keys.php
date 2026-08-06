<?php

$jwtDir = __DIR__ . '/../config/jwt';

if (!is_dir($jwtDir)) {
    mkdir($jwtDir, 0700, true);
}

$envPath = __DIR__ . '/../.env';
$passphrase = 'your_passphrase';

if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with($line, 'JWT_PASSPHRASE=')) {
            $passphrase = substr($line, strlen('JWT_PASSPHRASE='));
            break;
        }
    }
}

$privateKeyPath = $jwtDir . '/private.pem';
$publicKeyPath = $jwtDir . '/public.pem';

$generatePrivateCmd = escapeshellarg('C:\Program Files\Git\mingw64\bin\openssl.exe') . ' genrsa -aes256 -passout pass:' . escapeshellarg($passphrase) . ' -out ' . escapeshellarg($privateKeyPath) . ' 2048';
passthru($generatePrivateCmd);

$extractPublicCmd = escapeshellarg('C:\Program Files\Git\mingw64\bin\openssl.exe') . ' rsa -in ' . escapeshellarg($privateKeyPath) . ' -pubout -passin pass:' . escapeshellarg($passphrase) . ' -out ' . escapeshellarg($publicKeyPath);
passthru($extractPublicCmd);

chmod($privateKeyPath, 0600);
chmod($publicKeyPath, 0644);

echo "JWT keys generated successfully in {$jwtDir}/\n";
echo "  private.pem\n";
echo "  public.pem\n";