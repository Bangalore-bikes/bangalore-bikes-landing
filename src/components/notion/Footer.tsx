import { Moon, Sun } from "lucide-react";
import { Github } from "@/components/icons/github";
import * as React from "react";

import * as config from "@/lib/notion/config";
import { useDarkMode } from "@/lib/notion/use-dark-mode";

import styles from "./styles.module.css";

// TODO: merge the data and icons from PageSocial with the social links in Footer

export function FooterImpl() {
  const [hasMounted, setHasMounted] = React.useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const currentYear = new Date().getFullYear();

  const onToggleDarkMode = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      toggleDarkMode();
    },
    [toggleDarkMode]
  );

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.copyright}>
        Copyright {currentYear} {config.author}
      </div>

      <div className={styles.settings}>
        {hasMounted && (
          <a
            className={styles.toggleDarkMode}
            href="#"
            role="button"
            onClick={onToggleDarkMode}
            title="Toggle dark mode"
          >
            {isDarkMode ? <Moon /> : <Sun />}
          </a>
        )}
      </div>

      <div className={styles.social}>
        {config.github && (
          <a
            className={styles.github}
            href={`https://github.com/${config.github}`}
            title={`GitHub @${config.github}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github />
          </a>
        )}
      </div>
    </footer>
  );
}

export const Footer = React.memo(FooterImpl);
