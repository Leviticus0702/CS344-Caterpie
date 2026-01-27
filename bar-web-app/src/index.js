import React from "react";
import ReactDOM from "react-dom";
import "./index.css"; // Import Tailwind CSS
import App from "./App";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { createClient } from '@supabase/supabase-js';

// Supabase client initialization
const supabase = createClient(
  "https://yajgmjyhrbgailbygriw.supabase.co", 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhamdtanlocmJnYWlsYnlncml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI2ODQ3NzEsImV4cCI6MjAzODI2MDc3MX0.s53QjbzvugOsFru67O3sw2X4E7-JYq9gJ5CVRZrTwoY"
);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
      <App />
    </SessionContextProvider>
  </React.StrictMode>
);
