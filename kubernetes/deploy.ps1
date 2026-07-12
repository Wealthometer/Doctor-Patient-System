Param(
  [string]$AWS_ACCOUNT_ID = $env:AWS_ACCOUNT_ID,
  [string]$AWS_REGION = $env:AWS_REGION,
  [string]$AuthImage = $env:AUTH_IMAGE
)

Set-StrictMode -Version Latest

function Apply-File($path) {
  Write-Host "Applying $path"
  kubectl apply -f $path
}

function Apply-With-Subst($path) {
  $content = Get-Content -Raw -Path $path
  if ($PSBoundParameters.ContainsKey('AWS_ACCOUNT_ID') -and $AWS_ACCOUNT_ID) {
    $content = $content -replace '\$\{AWS_ACCOUNT_ID\}', $AWS_ACCOUNT_ID
  }
  if ($PSBoundParameters.ContainsKey('AWS_REGION') -and $AWS_REGION) {
    $content = $content -replace '\$\{AWS_REGION\}', $AWS_REGION
  }
  $tmp = [System.IO.Path]::GetTempFileName()
  Set-Content -Path $tmp -Value $content
  kubectl apply -f $tmp
  Remove-Item $tmp
}

$root = Join-Path -Path (Split-Path -Parent $MyInvocation.MyCommand.Path) -ChildPath '..' | Resolve-Path -Relative

Apply-File "$root/kubernetes/namespaces/namespace.yaml"
Apply-File "$root/kubernetes/configmaps/configmaps.yaml" -ErrorAction SilentlyContinue
Apply-File "$root/kubernetes/secrets/secrets.yaml" -ErrorAction SilentlyContinue
Apply-File "$root/kubernetes/statefulsets/postgres-statefulsets.yaml"

$deployments = "$root/kubernetes/deployments/deployments.yaml"
if (Get-Content $deployments -Raw | Select-String '\$\{AWS_ACCOUNT_ID\}') {
  if (-not $AWS_ACCOUNT_ID -or -not $AWS_REGION) {
    Write-Warning "AWS_ACCOUNT_ID or AWS_REGION not provided; placeholders may remain."
  }
  Apply-With-Subst $deployments
} else {
  Apply-File $deployments
}

Apply-File "$root/kubernetes/ingress/ingress.yaml" -ErrorAction SilentlyContinue
Apply-File "$root/kubernetes/hpa/hpa.yaml" -ErrorAction SilentlyContinue

if ($AuthImage) {
  Write-Host "Overriding auth-service image -> $AuthImage"
  kubectl -n healthcare-system set image deployment/auth-service auth-service=$AuthImage --record
  kubectl -n healthcare-system rollout status deployment/auth-service
}

Write-Host "Done. Run: kubectl -n healthcare-system get pods,svc,deploy,sts"
