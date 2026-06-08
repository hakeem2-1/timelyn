interface PageContainerProps {
  children: React.ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>;
}
