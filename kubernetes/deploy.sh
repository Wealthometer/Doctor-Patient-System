#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "Repo root: $REPO_ROOT"

echo "kubectl: $(which kubectl)"
kubectl version --client
kubectl config current-context
kubectl cluster-info

command -v kubectl >/dev/null 2>&1 || { echo >&2 "kubectl is required. Install it and re-run."; exit 1; }

apply_file() {
  local f="$1"
  echo "Applying $f"
  kubectl apply -f "$f"
}

apply_with_subst() {
  local f="$1"
  local tmp
  tmp=$(mktemp)
  if command -v envsubst >/dev/null 2>&1; then
    envsubst < "$f" > "$tmp"
  else
    # simple fallback for AWS vars
    tmp2="$tmp".out
    cp "$f" "$tmp2"
    if [ -n "${AWS_ACCOUNT_ID-}" ]; then
      sed -i.bak "s/\$\{AWS_ACCOUNT_ID\}/$AWS_ACCOUNT_ID/g" "$tmp2"
    fi
    if [ -n "${AWS_REGION-}" ]; then
      sed -i.bak "s/\$\{AWS_REGION\}/$AWS_REGION/g" "$tmp2"
    fi
    mv "$tmp2" "$tmp"
  fi
  kubectl apply -f "$tmp"
  rm -f "$tmp"
}

echo "Creating namespace..."
apply_file "$REPO_ROOT/kubernetes/namespaces/namespace.yaml"

echo "Applying configmaps and secrets..."
apply_file "$REPO_ROOT/kubernetes/configmaps/configmaps.yaml" || true
apply_file "$REPO_ROOT/kubernetes/secrets/secrets.yaml" || true

echo "Deploying statefulsets (Postgres)..."
apply_file "$REPO_ROOT/kubernetes/statefulsets/postgres-statefulsets.yaml"

echo "Deploying main manifests..."
if grep -q '\${AWS_ACCOUNT_ID}' "$REPO_ROOT/kubernetes/deployments/deployments.yaml" 2>/dev/null; then
  if [ -z "${AWS_ACCOUNT_ID-}" ] || [ -z "${AWS_REGION-}" ]; then
    echo "AWS_ACCOUNT_ID or AWS_REGION not set — set them or edits will replace placeholders incorrectly."
  fi
  apply_with_subst "$REPO_ROOT/kubernetes/deployments/deployments.yaml"
else
  apply_file "$REPO_ROOT/kubernetes/deployments/deployments.yaml"
fi

echo "Applying ingress and HPA (if present)..."
apply_file "$REPO_ROOT/kubernetes/ingress/ingress.yaml" || true
apply_file "$REPO_ROOT/kubernetes/hpa/hpa.yaml" || true

echo "Optional: override auth-service image by setting AUTH_IMAGE env var. Example: AUTH_IMAGE=elladev20/auth-service:latest $0"
if [ -n "${AUTH_IMAGE-}" ]; then
  echo "Overriding auth-service image -> $AUTH_IMAGE"
  kubectl -n healthcare-system set image deployment/auth-service auth-service="$AUTH_IMAGE" --record
  kubectl -n healthcare-system rollout status deployment/auth-service
fi

echo "Done. Use 'kubectl -n healthcare-system get pods,svc,deploy,sts' to inspect resources."
