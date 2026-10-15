// Run:   pnpm payload run src/seed/mock.ts
// Redo:  WIPE=true pnpm payload run src/seed/mock.ts   (deletes ALL posts and media first)
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import config from '@payload-config'
import { getPayload } from 'payload'

import type { Post } from '../payload-types'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const imageDir = path.join(dirname, 'images')
const payload = await getPayload({ config })
const context = { disableRevalidate: true } // there is no Next.js cache to refresh in a script

if (process.env.WIPE === 'true') {
  await payload.delete({ collection: 'posts', where: { id: { exists: true } }, context })
  await payload.delete({ collection: 'media', where: { id: { exists: true } }, context })
}

/* ---------- rich text builders (Lexical JSON) ---------- */
type Node = Record<string, unknown>
type Inline = string | Node

const text = (value: string, format = 0): Node => ({
  type: 'text',
  text: value,
  format,
  mode: 'normal',
  style: '',
  detail: 0,
  version: 1,
})
const b = (v: string) => text(v, 1) // bold
const i = (v: string) => text(v, 2) // italic
const link = (label: string, url: string): Node => ({
  type: 'link',
  version: 3,
  format: '',
  indent: 0,
  direction: 'ltr',
  fields: { linkType: 'custom', newTab: false, url },
  children: [text(label)],
})
const inline = (parts: Inline | Inline[]) =>
  (Array.isArray(parts) ? parts : [parts]).map((x) => (typeof x === 'string' ? text(x) : x))
const block = (type: string, extra: Node, children: Node[]): Node => ({
  type,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  ...extra,
  children,
})
const p = (parts: Inline | Inline[]) => block('paragraph', {}, inline(parts))
const h2 = (v: string) => block('heading', { tag: 'h2' }, inline(v))
const quote = (v: string) => block('quote', {}, inline(v))
const list = (kind: 'bullet' | 'number', items: (Inline | Inline[])[]) =>
  block(
    'list',
    { listType: kind, start: 1, tag: kind === 'bullet' ? 'ul' : 'ol' },
    items.map((item, n) => block('listitem', { value: n + 1 }, inline(item))),
  )
const richText = (...children: Node[]) =>
  ({
    root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children },
  }) as unknown as Post['content']

/* ---------- media ---------- */
async function upload(file: string, alt: string) {
  const filePath = path.join(imageDir, file)
  if (!fs.existsSync(filePath)) {
    console.warn(`Missing ${file}: continuing without this image`)
    return undefined
  }
  const doc = await payload.create({ collection: 'media', data: { alt }, filePath, context })
  return doc.id
}

const ALT = {
  examPrep: {
    en: 'A student writing notes in a notebook at a wooden desk, with a cup of tea beside the book',
    am: 'አንድ ተማሪ በእንጨት ጠረጴዛ ላይ በማስታወሻ ደብተር ሲጽፍ፤ ከመጽሐፉ አጠገብ አንድ ስኒ ሻይ ይታያል',
  },
  examShare: {
    en: 'An open notebook and pen on a wooden desk in warm morning light',
    am: 'በማለዳ ብርሃን በእንጨት ጠረጴዛ ላይ የተከፈተ ማስታወሻ ደብተርና እስክሪብቶ',
  },
  feedback: { en: 'A teacher reading a student’s written work at a classroom desk' },
  library: {
    en: 'Students reading and studying at long wooden tables in a school library',
    am: 'ተማሪዎች በትምህርት ቤት ቤተ መጻሕፍት ረጃጅም የእንጨት ጠረጴዛዎች ላይ ሲያነቡና ሲያጠኑ',
  },
}

/* ---------- languages ---------- */
async function ensureLanguage(data: {
  code: string
  name: string
  nativeName: string
  direction: 'ltr' | 'rtl'
  isDefault: boolean
}) {
  const { docs } = await payload.find({
    collection: 'languages',
    where: { code: { equals: data.code } },
    limit: 1,
    depth: 0,
  })
  // the hooks create the site-content document (copied from the default language)
  return (
    docs[0] ??
    payload.create({ collection: 'languages', data: { ...data, enabled: true }, context })
  )
}

const en = await ensureLanguage({
  code: 'en',
  name: 'English',
  nativeName: 'English',
  direction: 'ltr',
  isDefault: true,
})
const am = await ensureLanguage({
  code: 'am',
  name: 'Amharic',
  nativeName: 'አማርኛ',
  direction: 'ltr',
  isDefault: false,
})

/* ---------- site content: Amharic (English already holds the built-in defaults) ---------- */
const {
  docs: [amContent],
} = await payload.find({
  collection: 'site-content',
  where: { language: { equals: am.id } },
  limit: 1,
  depth: 0,
})
if (!amContent) throw new Error('No site-content document for Amharic. Check the language hooks.')

await payload.update({
  collection: 'site-content',
  id: amContent.id,
  context,
  data: {
    nav: { signIn: 'ይግቡ', openDashboard: 'ዳሽቦርድ ክፈት' },
    hero: {
      eyebrow: 'ለትምህርት ቤቶች የተዘጋጀ የተግባር አስተዳደር',
      title: 'እያንዳንዱን የቤት ሥራ',
      highlight: 'በጊዜው ይከታተሉ።',
      lead: 'SchoolHub ተማሪዎች ተግባሮቻቸውን የሚያስተዳድሩበት ቀላል ቦታ ይሰጣል፤ መምህራን ደግሞ ተግባሮቹን የሚገመግሙበት ግልጽ እይታ ያገኛሉ። ሁሉም በትምህርት ቤትዎ አስተዳዳሪ የሚመራ ነው።',
      primaryCta: 'ወደ SchoolHub ይግቡ',
      secondaryCta: 'እንዴት እንደሚሠራ ይመልከቱ',
      // Empty on purpose: /am shows the English note (fallback test).
      // To translate it, use: 'መለያዎች የሚፈጠሩት በትምህርት ቤትዎ አስተዳዳሪ ነው።'
      note: '',
    },
    features: {
      heading: 'ሁሉም በአንድ ቦታ',
      subheading: 'ሦስት ሚናዎች፣ አንድ ቀላል አሠራር።',
      items: [
        {
          title: 'በሚና የተወሰነ መዳረሻ',
          text: 'አስተዳዳሪዎች መለያዎችን ፈጥረው ሚና ይመድባሉ። እያንዳንዱ ተጠቃሚ ሚናው የሚፈቅድለትን ብቻ ያያል።',
          icon: 'shield',
        },
        {
          title: 'የግል ተግባር ክትትል',
          text: 'ተማሪዎች የራሳቸውን ተግባሮች ይፈጥራሉ፣ ያስተካክላሉ፣ ይሰርዛሉ፤ የወቅቱን ሁኔታና ቅድሚያም ሁልጊዜ ያያሉ።',
          icon: 'check',
        },
        {
          title: 'የመምህር ግምገማ',
          text: 'መምህራን የሁሉንም ተማሪዎች ተግባሮች ያያሉ፤ ይዘቱን ሳይነኩ እንደተጠናቀቀ ወይም ቅድሚያ የሚሰጠው ብለው ምልክት ያደርጋሉ።',
          icon: 'eye',
        },
      ],
    },
    preview: {
      heading: 'ውስጥ ትንሽ ጨረፍታ',
      subheading: 'በ SchoolHub የሚተዳደሩ የተግባር ምሳሌዎች።',
    },
    news: {
      heading: 'ዜና',
      subheading: 'ከ SchoolHub የሚወጡ ዝመናዎችና ማስታወቂያዎች።',
      readMore: 'ተጨማሪ ያንብቡ',
      home: 'መነሻ',
      back: 'ሁሉም ዜናዎች',
      empty: 'እስካሁን ምንም አልታተመም።',
    },
    footer: { text: '© {year} SchoolHub። በ Payload እና Next.js የተሠራ።' },
  },
})

/* ---------- posts ---------- */

// 1. English original: full SEO overrides, separate share image, rich formatting, internal link
const examCoverEn = await upload('exam-prep.jpg', ALT.examPrep.en)
const examShareEn = await upload('exam-share.jpg', ALT.examShare.en)
const studyEn = await payload.create({
  collection: 'posts',
  context,
  data: {
    _status: 'published',
    language: en.id,
    title: 'Five study habits that actually help before exams',
    slug: 'study-habits-before-exams',
    excerpt:
      'The week before exams is not the time to reread everything. These five habits, from planning backwards to protecting your sleep, make the hours you study count.',
    publishedAt: '2026-09-14T08:00:00.000Z',
    cover: examCoverEn,
    seo: {
      metaTitle: '5 Study Habits That Work Before Exams | SchoolHub',
      metaDescription:
        'Practical study habits for the week before exams: plan backwards, practise recall, and protect your sleep.',
      ogImage: examShareEn,
      noindex: false,
    },
    content: richText(
      p([
        'Most students know they should study. Fewer know ',
        i('how'),
        '. Rereading notes feels productive, but research on learning keeps pointing to a few habits that work better.',
      ]),
      h2('1. Plan backwards from the exam date'),
      p([
        'Start with the date of the exam and work back to today. Divide the topics across the days you have, and keep the last two days for review only. A plan on paper removes the daily question of ',
        i('what should I study now?'),
      ]),
      h2('2. Practise recalling, not rereading'),
      p([
        'Close the book and write down everything you remember about a topic. Then check your notes and fill the gaps. It feels harder, and ',
        b('that difficulty is the point'),
        ': pulling information out of memory is what strengthens it.',
      ]),
      h2('3. Mix subjects across a session'),
      list('bullet', [
        'Study one subject for 40 to 50 minutes.',
        'Take a 10 minute break away from your screen.',
        'Switch to a different subject, and come back to the first one the next day.',
      ]),
      h2('4. Teach it to someone else'),
      p(
        'Explain a topic out loud to a friend, a sibling, or even an empty chair. Where your explanation stumbles is exactly where you need to study more.',
      ),
      h2('5. Protect your sleep'),
      quote('A rested brain remembers more than a tired one that studied an extra hour.'),
      p(
        'Aim for a regular bedtime during exam week. Sleep is when the day’s memories are consolidated, so cutting it short undoes part of your work.',
      ),
      p([
        'Need a template for step one? Try our ',
        link('simple weekly planner', '/en/news/weekly-planner-guide'),
        '.',
      ]),
    ),
  },
})

// 2. Amharic translation of #1: empty slug (generated from the title), Amharic SEO and alt text
const examCoverAm = await upload('exam-prep.jpg', ALT.examPrep.am)
const examShareAm = await upload('exam-share.jpg', ALT.examShare.am)
await payload.create({
  collection: 'posts',
  context,
  data: {
    _status: 'published',
    language: am.id,
    translationOf: studyEn.id,
    title: 'ከፈተና በፊት የሚረዱ አምስት የጥናት ልምዶች',
    slug: '', // empty on purpose: the hook builds a slug from the Amharic title
    excerpt:
      'ከፈተና በፊት ያለው ሳምንት ሁሉንም ነገር እንደገና የማንበቢያ ጊዜ አይደለም። ከኋላ ወደ ፊት ከማቀድ እስከ እንቅልፍን መጠበቅ ያሉት እነዚህ አምስት ልምዶች የሚያጠኑባቸውን ሰዓታት ውጤታማ ያደርጋሉ።',
    publishedAt: '2026-09-15T08:00:00.000Z',
    cover: examCoverAm,
    seo: {
      metaTitle: 'ከፈተና በፊት የሚረዱ 5 የጥናት ልምዶች | SchoolHub',
      metaDescription:
        'ከፈተና በፊት ባለው ሳምንት የሚጠቅሙ ተግባራዊ የጥናት ልምዶች፦ ወደ ኋላ ማቀድ፣ ማስታወስን መለማመድና እንቅልፍን መጠበቅ።',
      ogImage: examShareAm,
      noindex: false,
    },
    content: richText(
      p([
        'አብዛኞቹ ተማሪዎች ማጥናት እንዳለባቸው ያውቃሉ፤ ',
        i('እንዴት'),
        ' እንደሚያጠኑ የሚያውቁ ግን ጥቂቶች ናቸው። ማስታወሻን ደጋግሞ ማንበብ ውጤታማ ይመስላል፤ ነገር ግን የመማር ጥናቶች ከዚያ የተሻሉ ጥቂት ልምዶችን ደጋግመው ይጠቁማሉ።',
      ]),
      h2('1. ከፈተናው ቀን ወደ ኋላ ያቅዱ'),
      p(
        'ከፈተናው ቀን ጀምረው እስከ ዛሬ ድረስ ወደ ኋላ ይቁጠሩ። ርዕሰ ጉዳዮቹን በሚኖርዎት ቀናት ያከፋፍሉ፤ የመጨረሻዎቹን ሁለት ቀናት ለክለሳ ብቻ ያቆዩ። በወረቀት ላይ የተጻፈ እቅድ በየቀኑ «አሁን ምን ላጥና?» የሚለውን ጥያቄ ያስወግዳል።',
      ),
      h2('2. እንደገና ከማንበብ ይልቅ ማስታወስን ይለማመዱ'),
      p([
        'መጽሐፉን ዘግተው ስለ አንድ ርዕስ የሚያስታውሱትን ሁሉ ይጻፉ። ከዚያ ማስታወሻዎን አይተው የጎደለውን ይሙሉ። ይህ ያስቸግራል፤ ',
        b('ያ አለመመቸት ዋናው ነገር ነው'),
        '፤ መረጃን ከትውስታ ማውጣት ነው የሚያጠነክረው።',
      ]),
      h2('3. በአንድ ጊዜ የተለያዩ ትምህርቶችን ይቀላቅሉ'),
      list('bullet', [
        'አንድ ትምህርት ከ40 እስከ 50 ደቂቃ ያጥኑ።',
        'ከስክሪን ርቀው የ10 ደቂቃ እረፍት ያድርጉ።',
        'ወደ ሌላ ትምህርት ይሸጋገሩ፤ በሚቀጥለው ቀን ወደ መጀመሪያው ይመለሱ።',
      ]),
      h2('4. ለሌላ ሰው ያስተምሩት'),
      p(
        'አንድን ርዕስ ለጓደኛ፣ ለወንድም ወይም ለእህት፣ አልፎ ተርፎም ለባዶ ወንበር ጮክ ብለው ያስረዱ። ማብራሪያዎ የሚደናቀፍበት ቦታ ይበልጥ ማጥናት የሚያስፈልግዎት ቦታ ነው።',
      ),
      h2('5. እንቅልፍዎን ይጠብቁ'),
      quote('ያረፈ አእምሮ አንድ ተጨማሪ ሰዓት ካጠና የደከመ አእምሮ የበለጠ ያስታውሳል።'),
      p(
        'በፈተና ሳምንት የተወሰነ የመኝታ ሰዓት ለማክበር ይሞክሩ። ትውስታዎች የሚጠናከሩት በእንቅልፍ ጊዜ ነው፤ ስለዚህ እንቅልፍን መቀነስ የሠሩትን ሥራ በከፊል ያጠፋል።',
      ),
      p(['ሌሎች ጽሑፎችን በ', link('ዜና', '/am/news'), ' ገጽ ያንብቡ።']),
    ),
  },
})

// 3. English only: no SEO fields (title and excerpt are used), portrait cover, no translations
await payload.create({
  collection: 'posts',
  context,
  data: {
    _status: 'published',
    language: en.id,
    title: 'How teachers can give feedback students will actually read',
    slug: 'effective-feedback-for-students',
    excerpt:
      'Long comments often go unread. Short, specific and timely feedback gets used. Here is a simple three-part format teachers can apply to any assignment.',
    publishedAt: '2026-09-28T10:30:00.000Z',
    cover: await upload('feedback.jpg', ALT.feedback.en),
    content: richText(
      p(
        'A page of comments in the margin looks thorough, but students tend to skim it. Feedback works when it is short enough to read, specific enough to act on, and early enough to matter.',
      ),
      h2('Keep it specific'),
      p(
        'Replace “good work” or “needs improvement” with a sentence that points at the exact place: what worked, or what to change.',
      ),
      h2('Make it timely'),
      p(
        'Feedback returned after the next assignment has started is rarely used. Even two sentences the day after the work is handed in are worth more than a full page a month later.',
      ),
      h2('End with one next step'),
      p('Finish with the single most useful thing to do next time. For example:'),
      list('bullet', [
        'Start each paragraph with its main point.',
        'Show the working for every step in the calculation.',
        'Check the evidence in your second example against the question.',
      ]),
    ),
  },
})

// 4. English, no cover image at all (and an ordered list)
await payload.create({
  collection: 'posts',
  context,
  data: {
    _status: 'published',
    language: en.id,
    title: 'A simple weekly planner for busy students',
    slug: 'weekly-planner-guide',
    excerpt:
      'You do not need an app to stay organised. A single sheet of paper, divided into seven days, is enough. Here is how to set it up in ten minutes.',
    publishedAt: '2026-10-02T07:15:00.000Z',
    content: richText(
      p(
        'You do not need an app to stay organised. A single sheet of paper divided into seven days is enough, and setting it up takes about ten minutes.',
      ),
      h2('What you need'),
      list('bullet', [
        'One sheet of paper (A4 is fine)',
        'A pen and a highlighter',
        'Your class timetable',
      ]),
      h2('Set it up'),
      list('number', [
        'Write the seven days across the page.',
        'Add fixed commitments: classes, clubs, family time.',
        'Add every task with a deadline on the day it is due.',
        'Each morning, circle your top three priorities for the day.',
      ]),
      p(
        'At the end of the week, spend five minutes looking at what moved and what did not. That review is what makes the next week better.',
      ),
    ),
  },
})

// 5. Draft: must return 404 publicly, but stay visible in the admin
await payload.create({
  collection: 'posts',
  draft: true,
  context,
  data: {
    _status: 'draft',
    language: en.id,
    title: 'Term two timetable changes (draft)',
    slug: 'term-two-timetable-changes',
    excerpt: 'Notes on the upcoming timetable changes. Not ready to publish yet.',
    content: richText(
      p(
        'Draft notes for the timetable changes in term two. Final dates to be confirmed by the school office.',
      ),
    ),
  },
})

// 6. Published but noindex: reachable by URL, hidden from the list, sitemap and hreflang
await payload.create({
  collection: 'posts',
  context,
  data: {
    _status: 'published',
    language: en.id,
    title: 'Parent evening sign-up',
    slug: 'parent-evening-signup',
    excerpt: 'Sign-up details for the parent evening. Shared by direct link only.',
    publishedAt: '2026-10-09T12:00:00.000Z',
    seo: { noindex: true },
    content: richText(
      p(
        'This page is shared by direct link with parents who signed up for the evening. It should not appear in search results.',
      ),
      p('Please arrive ten minutes early and bring your child’s latest report.'),
    ),
  },
})

// 7. Amharic original (low-resolution cover) ...
const libraryAm = await payload.create({
  collection: 'posts',
  context,
  data: {
    _status: 'published',
    language: am.id,
    title: 'የትምህርት ቤት ቤተ መጻሕፍትን በአግባቡ ለመጠቀም የሚረዱ ምክሮች',
    slug: '',
    excerpt:
      'ቤተ መጻሕፍት መጽሐፍ የሚወሰድበት ቦታ ብቻ አይደለም፤ ለማጥናት፣ ለመወያየትና ለመመራመርም ምቹ ቦታ ነው። ከእሱ ምርጡን ለማግኘት የሚረዱ ቀላል ምክሮች እነሆ።',
    publishedAt: '2026-10-05T09:00:00.000Z',
    cover: await upload('library.jpg', ALT.library.am),
    seo: {
      metaDescription: 'ቤተ መጻሕፍትን ለጥናት፣ ለውይይትና ለምርምር በአግባቡ ለመጠቀም የሚረዱ ቀላል ምክሮች።',
    },
    content: richText(
      p(
        'ቤተ መጻሕፍት መጽሐፍ የሚወሰድበት ቦታ ብቻ አይደለም። ለማጥናት፣ ለመወያየትና ለምርምር የሚሆን ጸጥ ያለ ቦታ ነው። ከእሱ ምርጡን ለማግኘት ጥቂት ቀላል ልምዶች ይረዱዎታል።',
      ),
      h2('ጸጥ ያለ የጥናት ቦታ ይምረጡ'),
      p(
        'ከበርና ከመተላለፊያ ራቅ ያለ ጠረጴዛ ይፈልጉ። ትኩረትዎን የሚሰርቅ ነገር በሌለበት ቦታ አንድ ሰዓት ማጥናት በጫጫታ ውስጥ ከሁለት ሰዓት የተሻለ ነው።',
      ),
      h2('ቤተ መጻሕፍት ባለሙያውን ይጠይቁ'),
      p(
        'ቤተ መጻሕፍት ባለሙያዎች መጽሐፍትን በፍጥነት ለማግኘት ይረዳሉ። ለፕሮጀክትዎ የሚሆን ምንጭ ሲፈልጉ በመደርደሪያዎች መካከል ከመዞር ይልቅ መጠየቅ ጊዜ ይቆጥባል።',
      ),
      h2('ማጣቀሻዎችን በአግባቡ ይጠቀሙ'),
      list('bullet', [
        'በርዕሰ ጉዳይ ወይም በደራሲ ስም ይፈልጉ።',
        'የተጠቀሙበትን ምንጭ ወዲያውኑ ይመዝግቡ።',
        'የተዋሱትን መጽሐፍ በተባለው ቀን ይመልሱ።',
      ]),
    ),
  },
})

// 8. ... and its English translation (reverse direction: x-default points here, the default language)
await payload.create({
  collection: 'posts',
  context,
  data: {
    _status: 'published',
    language: en.id,
    translationOf: libraryAm.id,
    title: 'Getting the most out of your school library',
    slug: 'school-library-tips',
    excerpt:
      'A library is more than a place to borrow books. It is a quiet space to study, discuss and research. These simple tips help you get the most out of it.',
    publishedAt: '2026-10-06T09:00:00.000Z',
    cover: await upload('library.jpg', ALT.library.en),
    content: richText(
      p(
        'A library is more than a place to borrow books. It is a quiet space to study, discuss and research, and a few simple habits help you get the most out of it.',
      ),
      h2('Choose a quiet place to study'),
      p(
        'Look for a table away from the door and the walking routes. An hour of study where nothing steals your attention beats two hours in the noise.',
      ),
      h2('Ask the librarian'),
      p(
        'Librarians can help you find books quickly. When you are looking for sources for a project, asking saves more time than wandering the shelves.',
      ),
      h2('Use the catalogue properly'),
      list('bullet', [
        'Search by subject or by author.',
        'Write down each source as soon as you use it.',
        'Return borrowed books on the due date.',
      ]),
    ),
  },
})

// 9. Edge case: very long title and a long excerpt (checks clamping and truncation)
await payload.create({
  collection: 'posts',
  context,
  data: {
    _status: 'published',
    language: en.id,
    title:
      'Everything you need to know about registering for next term’s elective subjects, exam entries and after-school clubs in one place',
    slug: 'registration-elective-subjects-exams-clubs',
    excerpt:
      'Registration for next term opens on the first Monday of the month and closes two weeks later. This guide explains how to choose electives, enter external exams and join after-school clubs, and what to do if you miss the deadline, so nothing is left to the last minute.',
    publishedAt: '2026-10-08T08:00:00.000Z',
    content: richText(
      p(
        'Registration for next term opens on the first Monday of the month and closes two weeks later. Read the sections below before you choose.',
      ),
      h2('Elective subjects'),
      p(
        'Pick two electives and one reserve. Places are limited, and the reserve is used if your first choice is full.',
      ),
      h2('External exam entries'),
      p(
        'Entries are made through the school office. Bring your candidate number and the fee receipt.',
      ),
      h2('After-school clubs'),
      p(
        'Clubs start in the second week of term. You can join up to two and change after the first month.',
      ),
      h2('If you miss the deadline'),
      p(
        'Speak to the school office as soon as possible. Late entries are accepted only when places remain.',
      ),
    ),
  },
})

console.log('Mock data created.')
process.exit(0)
