'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AdminSidebar.module.css';

const internalLinks = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/products', label: 'Produits & Stock' },
  { href: '/admin/orders', label: 'Commandes' },
  { href: '/admin/customers', label: 'Utilisateurs' },
  { href: '/admin/gallery', label: 'Galerie photo' },
];

const externalTools = [
  { href: 'https://console.cloudinary.com/', label: 'Cloudinary' },
  { href: 'https://vercel.com/dashboard', label: 'Vercel' },
  { href: 'https://cloud.mongodb.com/', label: 'MongoDB Atlas' },
  { href: 'https://ap.www.namecheap.com/dashboard', label: 'Namecheap' },
  { href: 'https://dashboard.stripe.com/', label: 'Stripe' },
  { href: 'https://www.chronopost.fr/expedier', label: 'Chronopost' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <p className={styles.section}>Gestion du site</p>
        {internalLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.link} ${pathname.startsWith(link.href) ? styles.active : ''}`}
          >
            {link.label}
          </Link>
        ))}

        <p className={styles.section}>Outils</p>
        {externalTools.map((tool) => (
          <a
            key={tool.href}
            href={tool.href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            {tool.label}
            <span className={styles.externalIcon} aria-hidden="true">↗</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
