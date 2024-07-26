import AppNavigation from "./src/navigation/AppNavigation";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CustomStatusBar from "./StatusBar/CustomStatusBar";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomStatusBar />
      <AppNavigation />
    </QueryClientProvider>
  );
}
