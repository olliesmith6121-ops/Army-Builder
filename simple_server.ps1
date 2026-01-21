$port = 8000
$root = Get-Location
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Listening on http://localhost:$port/"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $localPath = $request.Url.LocalPath
        if ($localPath -eq "/") { $localPath = "/index.html" }
        
        $relativePath = $localPath.TrimStart('/')
        $fullPath = Join-Path $root $relativePath
        
        if (Test-Path $fullPath -PathType Leaf) {
            try {
                $bytes = [System.IO.File]::ReadAllBytes($fullPath)
                $response.ContentLength64 = $bytes.Length
                
                if ($fullPath.EndsWith(".html")) { $response.ContentType = "text/html" }
                elseif ($fullPath.EndsWith(".json")) { $response.ContentType = "application/json" }
                elseif ($fullPath.EndsWith(".js")) { $response.ContentType = "application/javascript" }
                elseif ($fullPath.EndsWith(".css")) { $response.ContentType = "text/css" }
                elseif ($fullPath.EndsWith(".png")) { $response.ContentType = "image/png" }
                
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } catch {
                $response.StatusCode = 500
            }
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    }
} catch {
    Write-Error $_
} finally {
    $listener.Stop()
}
