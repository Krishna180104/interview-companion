import Spinner from "./Spinner";

function Button({
  children,
  onClick,
  loading = false,
  variant = "primary",
  className = "",
  type = "button",
}) {
  const baseStyle =
    "rounded-xl px-6 py-3 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50";

  const variants = {
    primary: "bg-black text-white hover:opacity-90",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    danger: "bg-red-600 text-white hover:opacity-90",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}

export default Button;