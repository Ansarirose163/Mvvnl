<?php
/**
 * MVVNL Attendance Proxy - PHP
 * Transparent Proxy + Branding + Play Store Validation Bypass
 */

// ==========================================
// 🔒 CONFIGURATION
// ==========================================
define('API_URL', 'https://mvvnlatt.com');

// 🔥 Branding
define('BRANDING_TEXT', '@MVVNL Premium');
define('BRAND_KEYS', ['Emp_FName', 'SName', 'L_Name', 'name', 'displayName', 'title']);

// ==========================================
// 🚀 MAIN HANDLER
// ==========================================

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Cookie, X-Requested-With, x-app-version, x-app-build, x-app-bundle-id, x-os, x-os-version, x-platform, x-device-brand, x-device-model, x-device-manufacturer, x-device-id, x-device-unique-id, x-device-name, x-device-is-tablet, x-device-is-emulator, x-android-api-level, x-play-integrity-token, x-play-integrity-request-hash');

// Handle OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Get path
$path = $_SERVER['REQUEST_URI'] ?? '/';
$parsed = parse_url($path);
$pathname = $parsed['path'] ?? '/';
$query = isset($parsed['query']) ? '?' . $parsed['query'] : '';

// ==========================================
// 🔥 PLAY STORE VALIDATION BYPASS
// ==========================================
// Is endpoint ko intercept karke hamesha success bhejo
if ($pathname === '/api/API/PlayStoreValidation') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'STATUS' => 'true',
        'DATA' => '1'
    ]);
    exit;
}

// ==========================================
// 🚫 BLOCK LOGOUT/DELETE
// ==========================================
if (strpos($pathname, '/logout') !== false || 
    strpos($pathname, '/signout') !== false ||
    strpos($pathname, '/delete') !== false ||
    strpos($pathname, '/deactivate') !== false) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'API_STATUS' => 'ERROR',
        'MSG' => 'Logout is disabled'
    ]);
    exit;
}

// ==========================================
// 🚫 BLOCK PROFILE EDIT/SETTINGS
// ==========================================
if (strpos($pathname, '/profile/edit') !== false || 
    strpos($pathname, '/settings') !== false ||
    strpos($pathname, '/account/update') !== false) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'API_STATUS' => 'ERROR',
        'MSG' => 'Profile editing is disabled'
    ]);
    exit;
}

// ==========================================
// 🔄 DETERMINE TARGET URL
// ==========================================
$target = API_URL . $path;

// ==========================================
// 📝 BUILD HEADERS
// ==========================================
$headers = [];

// Copy original headers (except hop-by-hop)
foreach (getallheaders() as $name => $value) {
    $lower = strtolower($name);
    if (in_array($lower, ['host', 'connection', 'content-length', 'content-encoding', 'transfer-encoding'])) {
        continue;
    }
    // 🔥 Play Store Validation Bypass - Signature check override
    if ($lower === 'x-play-integrity-token' || $lower === 'x-play-integrity-request-hash') {
        continue; // Remove these headers so API doesn't validate
    }
    $headers[$name] = $value;
}

// 🔥 Force headers for bypass
$headers['x-app-version'] = 'V.1.50.0';
$headers['x-app-build'] = '50';
$headers['x-app-bundle-id'] = 'com.mnnvlattendancesystem';
$headers['x-os'] = 'Android';
$headers['x-os-version'] = '11';
$headers['x-platform'] = 'android';
$headers['x-device-brand'] = 'POCO';
$headers['x-device-model'] = 'M2103K19PI';
$headers['x-device-manufacturer'] = 'Xiaomi';
$headers['x-device-id'] = 'camellia';
$headers['x-device-unique-id'] = 'c6a4747b01cb9ea6';
$headers['x-device-name'] = 'POCO M3 Pro 5G';
$headers['x-device-is-tablet'] = '0';
$headers['x-device-is-emulator'] = '0';
$headers['x-android-api-level'] = '30';
$headers['User-Agent'] = 'okhttp/4.12.0';

// Content headers
if (!isset($headers['Content-Type']) && !isset($headers['content-type'])) {
    $headers['Content-Type'] = 'application/json; charset=utf-8';
}

// ==========================================
// 🔄 GET REQUEST BODY
// ==========================================
$method = $_SERVER['REQUEST_METHOD'];
$body = null;

if ($method !== 'GET' && $method !== 'HEAD') {
    $body = file_get_contents('php://input');
}

// ==========================================
// 🚀 FORWARD REQUEST
// ==========================================
try {
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $target);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    // Build header array
    $headerArray = [];
    foreach ($headers as $name => $value) {
        $headerArray[] = "$name: $value";
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headerArray);
    
    // Set body
    if ($body !== null && $body !== '') {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    
    // Execute
    $response = curl_exec($ch);
    
    // Check for curl error
    if ($response === false) {
        throw new Exception('CURL Error: ' . curl_error($ch));
    }
    
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    
    curl_close($ch);
    
    // Split headers and body
    $responseHeaders = substr($response, 0, $headerSize);
    $responseBody = substr($response, $headerSize);
    
    // ==========================================
    // 🔥 PROCESS RESPONSE - Branding Add
    // ==========================================
    $contentType = '';
    $headerLines = explode("\r\n", $responseHeaders);
    foreach ($headerLines as $line) {
        if (stripos($line, 'Content-Type:') === 0) {
            $contentType = trim(substr($line, 13));
            break;
        }
    }
    
    // Check if response is JSON
    $isJson = false;
    $jsonData = null;
    
    if (strpos($contentType, 'application/json') !== false) {
        $jsonData = json_decode($responseBody, true);
        if ($jsonData !== null && is_array($jsonData)) {
            $isJson = true;
        }
    }
    
    // 🔥 If JSON, add branding
    if ($isJson) {
        $jsonData = addBranding($jsonData);
        $responseBody = json_encode($jsonData);
    }
    
    // 🔥 FORWARD RESPONSE HEADERS
    $headerLines = explode("\r\n", $responseHeaders);
    foreach ($headerLines as $line) {
        if (empty($line) || strpos($line, 'HTTP/') === 0) continue;
        if (stripos($line, 'Content-Encoding') === 0) continue;
        if (stripos($line, 'Content-Length') === 0) continue;
        if (stripos($line, 'Transfer-Encoding') === 0) continue;
        header($line);
    }
    
    // Force JSON content type
    if ($isJson) {
        header('Content-Type: application/json; charset=utf-8');
    }
    
    http_response_code($httpCode);
    echo $responseBody;
    
} catch (Exception $e) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(502);
    echo json_encode([
        'API_STATUS' => 'ERROR',
        'MSG' => 'Proxy Error: ' . $e->getMessage()
    ]);
}

// ==========================================
// 🔥 BRANDING FUNCTION
// ==========================================
function addBranding($data) {
    if (!is_array($data) && !is_object($data)) {
        return $data;
    }
    
    $tag = ' [' . BRANDING_TEXT . ']';
    $brandKeys = BRAND_KEYS;
    
    // Check for DATA array in response
    if (isset($data['DATA']) && is_array($data['DATA'])) {
        $data['DATA'] = processArray($data['DATA'], $brandKeys, $tag);
    }
    
    // Check for Location array
    if (isset($data['Location']) && is_array($data['Location'])) {
        $data['Location'] = processArray($data['Location'], $brandKeys, $tag);
    }
    
    // Check for ATTENDANCE array
    if (isset($data['ATTENDANCE']) && is_array($data['ATTENDANCE'])) {
        $data['ATTENDANCE'] = processArray($data['ATTENDANCE'], $brandKeys, $tag);
    }
    
    // Check for HOLIDAY array
    if (isset($data['HOLIDAY']) && is_array($data['HOLIDAY'])) {
        $data['HOLIDAY'] = processArray($data['HOLIDAY'], $brandKeys, $tag);
    }
    
    // Check for EmpParList
    if (isset($data['EmpParList']) && is_array($data['EmpParList'])) {
        $data['EmpParList'] = processArray($data['EmpParList'], $brandKeys, $tag);
    }
    
    return $data;
}

function processArray($items, $brandKeys, $tag) {
    if (!is_array($items)) {
        return $items;
    }
    
    foreach ($items as &$item) {
        if (!is_array($item)) {
            continue;
        }
        
        foreach ($brandKeys as $key) {
            if (isset($item[$key]) && is_string($item[$key]) && !empty($item[$key])) {
                if (strpos($item[$key], BRANDING_TEXT) === false) {
                    $item[$key] = trim($item[$key]) . $tag;
                }
            }
        }
    }
    
    return $items;
}
?>
