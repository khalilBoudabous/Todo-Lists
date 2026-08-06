<?php
echo "REQUEST_URI=" . ($_SERVER['REQUEST_URI'] ?? 'N/A') . PHP_EOL;
echo "SCRIPT_NAME=" . ($_SERVER['SCRIPT_NAME'] ?? 'N/A') . PHP_EOL;
echo "HTTP_HOST=" . ($_SERVER['HTTP_HOST'] ?? 'N/A') . PHP_EOL;
echo "PHP_SELF=" . ($_SERVER['PHP_SELF'] ?? 'N/A') . PHP_EOL;
echo "QUERY_STRING=" . ($_SERVER['QUERY_STRING'] ?? 'N/A') . PHP_EOL;
