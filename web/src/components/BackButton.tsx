import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  to: string;
  label?: string;
}

function BackButton({ to, label = "Kembali" }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <button type="button" className="back-button" onClick={() => navigate(to)}>
      <span aria-hidden="true">←</span>
      {label}
    </button>
  );
}

export default BackButton;
