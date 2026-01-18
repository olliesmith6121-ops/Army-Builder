$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "Server listening on http://localhost:$port/"
    Write-Host "Press Ctrl+C to stop."
} catch {
    Write-Error "Failed to start listener: $_"
    exit 1
}

$mimeTypes = @{
    ".html" = "text/html"
    ".css"  = "text/css"
    ".js"   = "application/javascript"
    ".json" = "application/json"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".pdf"  = "application/pdf"
}

try {
    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            $path = $request.Url.LocalPath
            if ($path -eq "/") { $path = "/index.html" }
            
            # Remove leading slash and convert to local path
            $localPath = $path.TrimStart('/')
            $filePath = Join-Path $PWD $localPath

            Write-Host "Request: $path"

            if (Test-Path $filePath -PathType Leaf) {
                try {
                    $content = [System.IO.File]::ReadAllBytes($filePath)
                    $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
                    
                    if ($mimeTypes.ContainsKey($extension)) {
                        $response.ContentType = $mimeTypes[$extension]
                    } else {
                        $response.ContentType = "application/octet-stream"
                    }
                    
                    $response.ContentLength64 = $content.Length
                    $response.OutputStream.Write($content, 0, $content.Length)
                    $response.StatusCode = 200
                } catch {
                    Write-Error "Error serving file: $_"
                    $response.StatusCode = 500
                }
            } else {
                $response.StatusCode = 404
            }
            
            $response.Close()
        } catch {
            Write-Error "Error processing request: $_"
        }
    }
} finally {
    $listener.Stop()
}
