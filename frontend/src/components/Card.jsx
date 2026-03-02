function Card({ children, className = "" }) {
  return (
    <div className={`bg-white p-10 rounded-2xl shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

export default Card;