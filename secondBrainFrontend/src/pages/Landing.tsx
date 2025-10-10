import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Brain, Share2, BookOpen, Video, FileText, Twitter, Moon, Sun } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { toggleDarkMode } from "../store/slices/uiSlice";
import { useTheme } from "../hooks/useTheme";

export const Landing = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector(state => state.ui.isDarkMode);
  
  // Initialize theme
  useTheme();

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
        </div>
          <h1 className="text-2xl font-semibold text-foreground">
            {"Brainly"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleToggleDarkMode}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          <Button
            variant="secondary"
            text="Sign In"
            onClick={() => navigate("/signin")}
            size="sm"
            className="bg-transparent  text-foreground font-normal hover:bg-accent hover:border "
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center px-6 py-20">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground mb-4 mt-5">
            <Share2 className="w-4 h-4" />
            Content Organization Made Simple
          </div>


          <h2 className="text-5xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Organize and share<br />
            your{" "}
            <span className="text-accent">favorite content</span>
          </h2>
          
          <p className="text-md text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
            Save, organize, and share your favorite tweets, YouTube videos, <br />
            articles, and notes all in one beautiful, intuitive platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
              variant="primary"
              text="Get Started Free"
              size="lg"
              onClick={() => navigate("/signup")}
              className="px-8 py-4 text-lg font-normal bg-primary text-white dark:bg-white dark:text-black hover:bg-primary/90 dark:hover:bg-gray-100"
            />

            <Button
              variant="secondary"
              text="Sign In"
              onClick={() => navigate("/signin")}
              className="px-8 py-4 text-lg font-normal bg-transparent border border-border text-foreground hover:bg-accent hover:text-white"
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto my-20  ">
          <div className="text-center mb-8 ">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Everything you need to organize content
            </h3>
            <p className="text-lg text-muted-foreground">
              Powerful features to help you save and share what matters most
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Save Tweets */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Twitter className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-sm font-semibold text-card-foreground mb-3">
                Save Tweets
              </h4>
              <p className="text-muted-foreground">
                Bookmark and organize your favorite tweets with tags and notes
              </p>
            </div>

            {/* YouTube Videos */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Video className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h4 className="text-sm font-semibold text-card-foreground mb-3">
                YouTube Videos
              </h4>
              <p className="text-muted-foreground">
                Create playlists and save videos for later viewing
              </p>
            </div>

            {/* Articles */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center">
              <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <BookOpen className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h4 className="text-sm font-semibold text-card-foreground mb-3">
                Articles
              </h4>
              <p className="text-muted-foreground">
                Save articles and blog posts with smart categorization
              </p>
            </div>

            {/* Personal Notes */}
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center">
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="text-sm font-semibold text-card-foreground mb-3">
                Personal Notes
              </h4>
              <p className="text-muted-foreground">
                Write and organize your thoughts and ideas
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-foreground rounded-2xl p-12 text-center">
            <h3 className="text-3xl font-bold text-primary-foreground mb-4">
              Ready to get organized?
            </h3>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Join thousands of users who have transformed how they manage content
            </p>
            <Button
              variant="secondary"
              text="Start Organizing Today"
              onClick={() => navigate("/signup")}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-4 text-lg rounded-xl"
            />
          </div>
        </div>  
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 Brainly. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};