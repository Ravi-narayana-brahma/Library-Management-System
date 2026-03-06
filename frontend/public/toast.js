export function showToast(message, type = "info") {
  const toastBox = document.getElementById("toastBox");

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "❌";
  if (type === "warning") icon = "⚠️";

  toast.innerHTML = `${icon} ${message}`;
  toastBox.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}
