"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useUser } from "../contexts/UserContext";
import { useToast } from "../contexts/ToastContext";
import { KoetoriExplanation } from "./KoetoriExplanation";
import { Button } from "./ui/Button";

export function UsernameInput() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [mode, setMode] = useState<"username" | "signup" | "login">("username");
  const [existingUsername, setExistingUsername] = useState("");
  const { setUsername } = useUser();
  const { showError } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when mode changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode]);

  const checkUserExists = async (username: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from("users")
      .select("username")
      .eq("username", username.toLowerCase())
      .limit(1);

    if (error) {
      showError(`Failed to check username: ${error.message}`);
      return false;
    }

    return data.length > 0;
  };

  const createUser = async (
    username: string,
    secret: string
  ): Promise<boolean> => {
    const { error } = await supabase.from("users").insert({
      username: username.toLowerCase(),
      secret_word: secret.toLowerCase(),
    });

    if (error) {
      showError(`Failed to create account: ${error.message}`);
      return false;
    }
    return true;
  };

  const validateLogin = async (
    username: string,
    secret: string
  ): Promise<boolean> => {
    const { data, error } = await supabase
      .from("users")
      .select("secret_word")
      .eq("username", username.toLowerCase())
      .eq("secret_word", secret.toLowerCase())
      .limit(1);

    if (error) {
      showError(`Failed to validate login: ${error.message}`);
      return false;
    }

    return data.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsChecking(true);
    setError("");

    const normalizedUsername = input.toLowerCase().trim();

    if (mode === "username") {
      // Basic validation
      if (normalizedUsername.length < 2) {
        setError("Name must be at least 2 characters");
        setIsChecking(false);
        return;
      }

      if (!/^[a-z0-9_]+$/.test(normalizedUsername)) {
        setError("Name can only contain letters, numbers, and underscores");
        setIsChecking(false);
        return;
      }

      // Check if user exists
      const userExists = await checkUserExists(normalizedUsername);

      if (userExists) {
        // User exists, switch to login mode
        setExistingUsername(normalizedUsername);
        setMode("login");
        setInput(""); // Clear input for secret word
        setIsChecking(false);
      } else {
        // New user, switch to signup mode
        setExistingUsername(normalizedUsername);
        setMode("signup");
        setInput(""); // Clear input for secret word
        setIsChecking(false);
      }
    } else if (mode === "signup") {
      // Creating new user with secret word
      if (!input.trim()) {
        setError("Please enter a secret word");
        setIsChecking(false);
        return;
      }

      const success = await createUser(existingUsername, input.trim());
      if (success) {
        setUsername(existingUsername);
      } else {
        setError("Failed to create account. Please try again.");
      }
      setIsChecking(false);
    } else if (mode === "login") {
      // Logging in with secret word
      if (!input.trim()) {
        setError("Please enter your secret word");
        setIsChecking(false);
        return;
      }

      const isValid = await validateLogin(existingUsername, input.trim());
      if (isValid) {
        setUsername(existingUsername);
      } else {
        setError("Wrong secret word. Try again!");
      }
      setIsChecking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0f]/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/10 via-transparent to-[#f43f5e]/10 pointer-events-none" />

      <div className="relative max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            {mode === "login" ? "🍗" : mode === "signup" ? "✨" : "🐓"}
          </div>
          <h1 className="text-3xl font-light text-white mb-2">
            {mode === "login" ? (
              `Welcome back, ${existingUsername}!`
            ) : mode === "signup" ? (
              "Almost there!"
            ) : (
              <span className="text-white">
                Welcome to{" "}
                <KoetoriExplanation>
                  <span className="bg-gradient-to-r from-[#818cf8] via-[#c084fc] to-[#fb7185] bg-clip-text text-transparent">
                    Koetori
                  </span>
                </KoetoriExplanation>
                .
              </span>
            )}
          </h1>
          <p className="text-[#94a3b8] text-lg">
            {mode === "login"
              ? "What's your secret word?"
              : mode === "signup"
                ? "Pick a secret word (pet's name, favorite snack, etc.)"
                : "What should we call you?"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(mode === "signup" || mode === "login") && (
            <Button
              type="button"
              onClick={() => {
                setMode("username");
                setInput("");
                setError("");
                setExistingUsername("");
              }}
              variant="unstyled"
              size="custom"
              className="w-full p-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              ← Try a different name
            </Button>
          )}

          <div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                mode === "username"
                  ? "Enter your name"
                  : mode === "signup"
                    ? "Your secret word"
                    : "Enter secret word"
              }
              className="w-full p-4 bg-[#1e1f2a]/60 backdrop-blur-xl border border-slate-700/50 rounded-xl text-white text-lg placeholder-slate-400 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/70 transition-all"
              autoFocus
              disabled={isChecking}
            />
            {error && (
              <p className="text-red-400 text-sm mt-2 animate-in slide-in-from-top-1">
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={!input.trim() || isChecking}
            variant="unstyled"
            size="custom"
            className="w-full p-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-slate-500 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
          >
            {isChecking ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {mode === "username" ? "Checking..." : "Processing..."}
              </div>
            ) : (
              <>
                {mode === "username" && "Get Started"}
                {mode === "signup" && "Create Account"}
                {mode === "login" && "Sign In"}
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Your name will be saved locally on this device
        </p>
      </div>
    </div>
  );
}
