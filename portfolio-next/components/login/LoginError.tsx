type LoginErrorProps = {
  message: string;
};

export default function LoginError({ message }: LoginErrorProps) {
  return (
    <div className="p-4 rounded-lg text-center bg-pink/20 text-pink border border-pink/50">
      {message}
    </div>
  );
}
