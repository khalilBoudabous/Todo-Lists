$base = "C:\Users\KBoudabous\Desktop\mini full-stack\frontend\src\app"

$files = @(
    "dashboard\todolists\[id]\page.tsx",
    "dashboard\todolists\[id]\edit\page.tsx",
    "dashboard\todolists\[id]\tasks\page.tsx",
    "dashboard\todolists\[id]\tasks\create\page.tsx",
    "dashboard\tasks\[id]\page.tsx",
    "dashboard\tasks\[id]\edit\page.tsx",
    "dashboard\admin\users\[id]\page.tsx",
    "dashboard\admin\users\[id]\edit\page.tsx",
    "dashboard\admin\todolists\[id]\page.tsx",
    "dashboard\admin\todolists\[id]\edit\page.tsx",
    "dashboard\admin\todolists\[id]\tasks\page.tsx",
    "dashboard\admin\todolists\[id]\tasks\create\page.tsx"
)

$replacements = @(
    @("hover:bg-blue-700", "hover:bg-primary-dark"),
    @("hover:bg-red-700", "hover:bg-danger"),
    @("hover:bg-gray-700", "hover:bg-sidebar-hover"),
    @("hover:bg-gray-50", "hover:bg-background"),
    @("hover:text-blue-800", "hover:text-primary-dark"),
    @("hover:text-red-800", "hover:text-danger"),
    @("hover:text-yellow-800", "hover:text-warning"),
    @("hover:text-green-800", "hover:text-success"),
    @("bg-gray-50", "bg-background"),
    @("bg-gray-100", "bg-secondary-light"),
    @("bg-white", "bg-card-bg"),
    @("bg-gray-800", "bg-sidebar-bg"),
    @("text-gray-900", "text-foreground"),
    @("text-gray-800", "text-foreground"),
    @("text-gray-700", "text-foreground"),
    @("text-gray-600", "text-muted"),
    @("text-gray-500", "text-muted"),
    @("text-gray-400", "text-muted"),
    @("text-gray-300", "text-sidebar-text"),
    @("bg-blue-600", "bg-primary"),
    @("bg-blue-700", "bg-primary-dark"),
    @("text-blue-600", "text-primary"),
    @("text-blue-800", "text-primary-dark"),
    @("bg-blue-100", "bg-primary-light"),
    @("text-blue-700", "text-primary-dark"),
    @("border-gray-300", "border-border"),
    @("border-gray-200", "border-border"),
    @("bg-red-600", "bg-danger"),
    @("text-red-600", "text-danger"),
    @("text-red-700", "text-danger"),
    @("bg-red-100", "bg-red-50"),
    @("border-red-400", "border-danger"),
    @("bg-green-100", "bg-green-50"),
    @("text-green-800", "text-success"),
    @("bg-yellow-100", "bg-yellow-50"),
    @("text-yellow-800", "text-warning")
)

$updatedFiles = @()

foreach ($file in $files) {
    $path = Join-Path $base $file
    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    $original = $content

    foreach ($pair in $replacements) {
        $content = $content.Replace($pair[0], $pair[1])
    }

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
        $updatedFiles += $file
        Write-Host "Updated: $file"
    } else {
        Write-Host "No changes: $file"
    }
}

Write-Host "`nTotal files updated: $($updatedFiles.Count)"