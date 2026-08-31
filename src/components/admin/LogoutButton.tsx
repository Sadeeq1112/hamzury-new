"use client";

export function LogoutButton() {
  return (
    <button
      className="out"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        location.href = "/admin/login";
      }}
    >
      Sign out
    </button>
  );
}
