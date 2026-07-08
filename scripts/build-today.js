const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'posts');
const TEMPLATE_PATH = path.join(ROOT, 'templates', 'today.html');
const OUTPUT_PATH = path.join(ROOT, 'today.html');

function normalizeDate(date, fallback) {
  if (date instanceof Date) {
    return date.toISOString().slice(0, 10);
  }
  if (typeof date === 'string') {
    return date.slice(0, 10);
  }
  return fallback;
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function loadPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];

  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const dateFromFilename = file.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
      const { data, content } = matter(raw);
      const date = normalizeDate(data.date, dateFromFilename);

      return {
        date,
        html: marked.parse(content.trim()),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

function renderEntries(posts) {
  if (!posts.length) {
    return '<p class="journal-empty">No entries yet. Check back soon.</p>';
  }

  return posts
    .map(
      (post) => `
        <article>
          <time datetime="${post.date}">${formatDate(post.date)}</time>
          <div class="journal-body">
            ${post.html}
          </div>
        </article>`
    )
    .join('\n');
}

function build() {
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const entries = renderEntries(loadPosts());
  const output = template.replace('<!-- ENTRIES -->', entries);

  fs.writeFileSync(OUTPUT_PATH, output, 'utf8');
  console.log(`Built ${OUTPUT_PATH} (${loadPosts().length} entries)`);
}

build();
