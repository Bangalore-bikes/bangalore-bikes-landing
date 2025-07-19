import { Github } from "@/components/icons/github";
import * as React from "react";

import * as config from "@/lib/notion/config";

import styles from "./styles.module.css";

// TODO: merge the data and icons from PageSocial with the social links in Footer

export function FooterImpl() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.copyright}>
        Copyright {currentYear} {config.author}
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
