interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="w-full p-3 sm:p-4 bg-[#f43f5e]/10 border border-[#f43f5e]/30 rounded-xl">
      <p className="text-[#fb7185] text-xs sm:text-sm font-light">{message}</p>
    </div>
  );
}
