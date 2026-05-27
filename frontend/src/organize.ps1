$dir = "c:\Users\suyas\OneDrive\Desktop\singularity\singularity\frontend\src\components"
$files = Get-ChildItem -Path $dir -Filter "*.tsx" -File
foreach ($file in $files) {
    $name = $file.BaseName
    $targetDir = Join-Path -Path $dir -ChildPath $name
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
    Move-Item -Path $file.FullName -Destination $targetDir
    
    $cssFile = Join-Path -Path $dir -ChildPath ($name + ".module.css")
    if (Test-Path $cssFile) {
        Move-Item -Path $cssFile -Destination $targetDir
    }
}
