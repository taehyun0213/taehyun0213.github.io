"""Build an accessible English static homepage. Python standard library only."""
import argparse
import html
import json
import re
import shutil
from datetime import date
from pathlib import Path
from urllib.parse import quote, urlparse

ROOT = Path(__file__).resolve().parent
SITE_URL = "https://taehyun0213.github.io"
E = lambda value: html.escape(str(value), quote=True)


def validate(data):
    bilingual = {"en": str, "ko": str}
    timeline_item = {"date": str, "title": bilingual, "place": bilingual}
    schema = {
        "profile": {"name": str, "korean_name": str, "email": str, "scholar": str, "faculty": str, "portrait": str,
                    **{key: bilingual for key in ("role", "department", "university", "location", "headline", "intro")}, "bio": [bilingual]},
        "research": [{"title": bilingual, "text": bilingual}],
        "featured_project": {"name": str, **{key: bilingual for key in ("eyebrow", "headline", "text", "extension", "role", "image_alt", "credit")}, "image": str, "url": str, "tags": [str]},
        "projects": [{"name": bilingual, "category": bilingual, "text": bilingual, "tags": [str], "url": str}],
        "publications": [{"year": int, "type": str, "title": str, "authors": str, "venue": str, "url": str, "note": str}],
        "appointments": [timeline_item], "education": [timeline_item], "service": [bilingual],
        "recruitment": {"open": bool, **{key: bilingual for key in ("headline", "intro", "interests", "skills", "note")}, "steps": [bilingual], "subject": str},
        "labels": {key: bilingual for key in ("about", "research", "publications", "background", "join", "contact", "recruiting", "scholar", "interests", "project_link", "related_work", "selected_publications", "publication_intro", "all", "journals", "conferences", "read_paper", "appointments", "education", "service", "email_me", "student_contact", "contact_title", "contact_text", "faculty_profile", "skip", "menu")},
    }
    def check(value, expected, path):
        if isinstance(expected, dict):
            if not isinstance(value, dict):
                raise ValueError(f"An object is required: {path}")
            for key, field in expected.items():
                if key not in value:
                    raise ValueError(f"Missing field: {path}.{key}")
                check(value[key], field, f"{path}.{key}")
        elif isinstance(expected, list):
            if not isinstance(value, list):
                raise ValueError(f"A list is required: {path}")
            for index, item in enumerate(value):
                check(item, expected[0], f"{path}[{index}]")
        elif type(value) is not expected:
            raise ValueError(f"Expected {expected.__name__}: {path}")
        elif expected is str and not value.strip() and not (path.endswith('.ko') or path.endswith('.note') or (path.startswith('content.projects[') and path.endswith('.url'))):
            raise ValueError(f"Text is required: {path}")
    check(data, schema, "content")
    required = {"profile", "research", "featured_project", "projects", "publications", "appointments", "education", "service", "recruitment", "labels"}
    if not required.issubset(data):
        raise ValueError("Missing sections: " + ", ".join(sorted(required - data.keys())))
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", data["profile"]["email"]):
        raise ValueError("Please enter a valid email address in profile.email")
    def walk(value, path="content"):
        if isinstance(value, dict):
            if "en" in value or "ko" in value:
                if not isinstance(value.get("en"), str) or not isinstance(value.get("ko"), str):
                    raise ValueError(f"Both en and ko text are required: {path}")
            for key, item in value.items():
                if key in {"url", "scholar", "faculty"} and isinstance(item, str) and item:
                    parsed = urlparse(item)
                    if parsed.scheme != "https" or not parsed.netloc or parsed.username or parsed.password:
                        raise ValueError(f"An https URL is required: {path}.{key}")
                walk(item, f"{path}.{key}")
        elif isinstance(value, list):
            for index, item in enumerate(value):
                walk(item, f"{path}[{index}]")
    walk(data)
    for pub in data["publications"]:
        if pub["type"] not in ("journal", "conference") or not 1900 <= pub["year"] <= date.today().year + 10:
            raise ValueError("Each publication needs an integer year and journal/conference type")
    for path in (data["profile"]["portrait"], data["featured_project"]["image"]):
        p = (ROOT / path).resolve()
        if not p.is_relative_to(ROOT / "assets") or not p.is_file():
            raise ValueError(f"Image must exist inside assets/: {path}")


def render(data, lang="en"):
    if lang != "en":
        raise ValueError("Only the English homepage is published")
    p, f = data["profile"], data["featured_project"]
    root = "../" if lang == "ko" else "./"
    t = lambda value: value[lang] if isinstance(value, dict) else value
    label = lambda key: E(t(data["labels"][key]))
    external = lambda url, text, cls="": f'<a class="{cls}" href="{E(url)}" target="_blank" rel="noopener noreferrer">{text}</a>'
    nav = "".join(f'<a href="#{key}">{label(key)}</a>' for key in ("about", "research", "publications", "join", "contact"))
    name = p["korean_name"] if lang == "ko" else p["name"]
    bio = "".join(f'<p>{E(t(paragraph))}</p>' for paragraph in p["bio"])
    topics = "".join(f'<article class="topic"><span class="topic-number">0{i+1}</span><h3>{E(t(item["title"]))}</h3><p>{E(t(item["text"]))}</p></article>' for i,item in enumerate(data["research"]))
    tags = lambda values: '<ul class="tags">' + "".join(f'<li>{E(v)}</li>' for v in values) + '</ul>'
    projects = "".join(f'''<article class="project-card"><p class="eyebrow">{E(t(item["category"]))}</p><h3>{E(t(item["name"]))}</h3><p>{E(t(item["text"]))}</p>{tags(item["tags"])}{external(item["url"],label("project_link"),"text-link") if item["url"] else ''}</article>''' for item in data["projects"])
    pubs = ""
    award_labels = {
        "Best Paper Nominee": {"en": "Best Paper Nominee", "ko": "최우수 논문상 후보"},
        "Best Extended Abstract Nominee": {"en": "Best Extended Abstract Nominee", "ko": "최우수 확장초록상 후보"},
    }
    trophy = '<svg class="award-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 3h8v5a4 4 0 0 1-8 0V3Z"/><path d="M8 5H4v2a4 4 0 0 0 4 4M16 5h4v2a4 4 0 0 1-4 4M12 12v5M8 21h8M9 17h6v4H9z"/></svg>'
    for pub in sorted(data["publications"], key=lambda item: item["year"], reverse=True):
        authors = E(pub["authors"]).replace("Kim, T.", "<strong>Kim, T.</strong>")
        kind = label("journals") if pub["type"] == "journal" else label("conferences")
        note = pub.get("note", "")
        award = pub["type"] == "conference" and note.strip() in award_labels
        if award:
            note = t(award_labels[note.strip()])
        if lang == "ko" and note.startswith("First published online in "):
            note = note.rsplit(" ", 1)[1] + "년 온라인 선출판"
        note_html = f'<p class="pub-note pub-award">{trophy}<span>{E(note)}</span></p>' if award else (f'<p class="pub-note">{E(note)}</p>' if note else '')
        pubs += f'''<article class="publication" data-type="{E(pub["type"])}"><div class="pub-meta"><span class="pub-year">{pub["year"]}</span><span>{kind}</span></div><div class="pub-detail"><h3>{external(pub["url"],E(pub["title"]))}</h3><p class="authors">{authors}</p><p class="venue">{E(pub["venue"])}</p>{note_html}</div>{external(pub["url"],label("read_paper"),"pub-link")}</article>'''
    def timeline(items):
        return '<ol class="timeline">'+"".join(f'<li><span class="timeline-date">{E(item["date"].replace("present", "현재") if lang == "ko" else item["date"])}</span><div><h4>{E(t(item["title"]))}</h4><p>{E(t(item["place"]))}</p></div></li>' for item in items)+'</ol>'
    service = "".join(f'<li>{E(t(item))}</li>' for item in data["service"])
    r = data["recruitment"]
    steps = "".join(f'<li>{E(t(item))}</li>' for item in r["steps"])
    mail = f'mailto:{p["email"]}'
    student_mail = mail + '?subject=' + quote(r["subject"])
    recruit_badge = f'<a class="recruitment-badge" href="#join"><span aria-hidden="true"></span>{label("recruiting")}</a>' if r["open"] else ''
    filters = "".join(f'<button type="button" data-filter="{key}" aria-pressed="{"true" if key == "all" else "false"}">{label(lbl)}</button>' for key,lbl in (("all","all"),("journal","journals"),("conference","conferences")))
    structured = {"@context":"https://schema.org","@type":"Person","name":p["name"],"alternateName":p["korean_name"],"jobTitle":t(p["role"]),"email":p["email"],"url":SITE_URL + ("/ko/" if lang == "ko" else "/"),"affiliation":{"@type":"CollegeOrUniversity","name":t(p["university"])},"sameAs":[p["scholar"],p["faculty"]]}
    schema_json = json.dumps(structured, ensure_ascii=False).replace("<", "\\u003c")
    title = f'{name} | {t(p["university"])}'
    canonical = SITE_URL + ("/ko/" if lang == "ko" else "/")
    og_image = SITE_URL + "/" + p["portrait"]
    return f'''<!doctype html>
<html lang="{lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{E(title)}</title>
  <meta name="description" content="{E(t(p['intro']))}">
  <meta name="theme-color" content="#102e35">
  <meta property="og:title" content="{E(title)}">
  <meta property="og:description" content="{E(t(p['intro']))}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{E(canonical)}">
  <meta property="og:image" content="{E(og_image)}">
  <meta property="og:image:alt" content="{E(p['name'])}">
  <meta property="og:locale" content="{'ko_KR' if lang == 'ko' else 'en_US'}">
  <link rel="canonical" href="{E(canonical)}">
  <link rel="icon" href="{root}assets/research-mark.svg" type="image/svg+xml">
  <link rel="stylesheet" href="{root}assets/styles.css">
  <script type="application/ld+json">{schema_json}</script>
  <script src="{root}assets/site.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#main">{label('skip')}</a>
  <header class="site-header"><div class="container header-inner">
    <a class="brand" href="#"><img class="brand-mark" src="{root}assets/research-mark.svg" alt="" aria-hidden="true" width="44" height="44"><span>{E(p['name'])}<small>{E(p['korean_name'])}</small></span></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="{label('menu')}"><span></span><span></span></button>
    <nav id="site-nav" aria-label="{'주 메뉴' if lang == 'ko' else 'Main navigation'}">{nav}</nav>
  </div></header>
  <main id="main">
    <section class="hero container">
      <div class="hero-copy"><p class="eyebrow">{'LEARNING SCIENCES · EDUCATIONAL TECHNOLOGY' if lang == 'en' else '학습과학 · 교육공학'}</p><h1>{E(t(p['headline']))}</h1><p class="hero-intro">{E(t(p['intro']))}</p><div class="hero-actions"><a class="button primary" href="#research">{label('research')}</a>{external(p['scholar'],label('scholar'),'button secondary')}</div>{recruit_badge}</div>
      <aside class="profile-panel"><div class="portrait-frame"><img src="{root}{E(p['portrait'])}" alt="{E(p['name'])}" width="215" height="215" fetchpriority="high"></div><h2>{E(name)}</h2><p class="profile-role">{E(t(p['role']))}</p><p>{E(t(p['department']))}<br>{E(t(p['university']))}<img class="university-logo" src="{root}assets/skku-logo.png" alt="{E(t(p['university']))} {'로고' if lang == 'ko' else 'logo'}" width="206" height="46"></p><div class="profile-location">{E(t(p['location']))}</div><a class="profile-email" href="{E(mail)}">{E(p['email'])}</a></aside>
    </section>
    <div class="research-strip"><div class="container"><span>{'Embodied cognition' if lang == 'en' else '체화된 인지'}</span><span>{'Immersive learning' if lang == 'en' else '몰입형 학습'}</span><span>{'AI in education' if lang == 'en' else '교육용 AI'}</span><span>{'Multimodal analytics' if lang == 'en' else '멀티모달 분석'}</span></div></div>
    <section id="about" class="section container about-grid"><div class="section-heading"><p class="section-index">01 / {label('about')}</p><h2>{'Designing learning.<br>Understanding learners.' if lang == 'en' else '학습을 설계하고,<br>학습자를 이해합니다.'}</h2></div><div class="prose">{bio}</div></section>
    <section id="research" class="research-section"><div class="container"><div class="section-heading"><p class="section-index">02 / {label('research')}</p><h2>{label('interests')}</h2></div><div class="topics-grid">{topics}</div>
      <article class="featured-project"><div class="featured-heading"><div><p class="eyebrow">{E(t(f['eyebrow']))}</p><h3>{E(f['name'])}</h3></div><span class="project-role">{E(t(f['role']))}</span></div><figure><img src="{root}{E(f['image'])}" alt="{E(t(f['image_alt']))}" width="1348" height="346" loading="lazy"><figcaption>{E(t(f['credit']))}</figcaption></figure><div class="featured-body"><div><h4>{E(t(f['headline']))}</h4>{tags(f['tags'])}{external(f['url'],label('project_link'),'text-link')}</div><div><p>{E(t(f['text']))}</p><p>{E(t(f['extension']))}</p></div></div></article>
      <div class="projects-grid">{projects}</div>
    </div></section>
    <section id="publications" class="section container"><div class="section-top"><div class="section-heading"><p class="section-index">03 / {label('publications')}</p><h2>{label('selected_publications')}</h2></div>{external(p['scholar'],label('scholar'),'text-link')}</div><p class="section-description">{label('publication_intro')}</p><div class="publication-filters" role="group" aria-label="{'논문 유형' if lang == 'ko' else 'Publication type'}" hidden>{filters}</div><p id="publication-count" class="sr-only" aria-live="polite"></p><div class="publication-list">{pubs}</div></section>
    <section id="background" class="background-section"><div class="container"><div class="section-heading"><p class="section-index">04 / {label('background')}</p><h2>{label('background')}</h2></div><div class="background-grid"><div><h3>{label('appointments')}</h3>{timeline(data['appointments'])}</div><div><h3>{label('education')}</h3>{timeline(data['education'])}</div></div><div class="service-block"><h3>{label('service')}</h3><ul>{service}</ul></div></div></section>
    <section id="join" class="section container"><div class="join-panel"><div><p class="section-index">05 / {label('join')}</p>{f'<p class="open-label">{label("recruiting")}</p>' if r['open'] else ''}<h2>{E(t(r['headline']))}</h2><p>{E(t(r['intro']))}</p><p>{E(t(r['interests']))}</p><p>{E(t(r['skills']))}</p></div><div class="join-instructions"><h3>{'When you write' if lang == 'en' else '문의하실 때'}</h3><ol>{steps}</ol><a class="button light" href="{E(student_mail)}">{label('student_contact')}</a><p class="join-note">{E(t(r['note']))}</p></div></div></section>
    <section id="contact" class="container contact-section"><div><p class="section-index">06 / {label('contact')}</p><h2>{label('contact_title')}</h2><p>{label('contact_text')}</p></div><div class="contact-links"><a class="contact-email" href="{E(mail)}">{E(p['email'])}</a><div>{external(p['scholar'],label('scholar'),'text-link')}{external(p['faculty'],label('faculty_profile'),'text-link')}</div><p>{E(t(p['department']))} · {E(t(p['university']))}<br>{E(t(p['location']))}</p></div></section>
  </main>
  <footer class="container"><span>© {E(p['name'])}</span><span>{E(t(p['university']))}</span></footer>
</body>
</html>
'''


def legacy_redirect():
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Page moved | Taehyun Kim</title><meta name="robots" content="noindex">
<link rel="canonical" href="{SITE_URL}/"><meta http-equiv="refresh" content="0;url={SITE_URL}/">
<script>window.location.replace("{SITE_URL}/" + window.location.search + window.location.hash);</script>
</head><body><p>This page has moved. <a href="{SITE_URL}/">Visit the English homepage.</a></p></body></html>
'''


def build(output=None):
    data = json.loads((ROOT / "content.json").read_text(encoding="utf-8"))
    validate(data)
    (ROOT / "ko").mkdir(exist_ok=True)
    (ROOT / "index.html").write_text(render(data, "en"), encoding="utf-8")
    (ROOT / "ko/index.html").write_text(legacy_redirect(), encoding="utf-8")
    (ROOT / "assets/content.js").write_text("window.SITE_CONTENT = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    if output:
        dest = Path(output).resolve()
        if dest == ROOT or ROOT.is_relative_to(dest):
            raise ValueError("Output directory must not replace or contain the project")
        dest.mkdir(parents=True, exist_ok=True)
        shutil.copytree(ROOT / "assets", dest / "assets", dirs_exist_ok=True)
        if (dest / "ko").exists():
            shutil.rmtree(dest / "ko")
        (dest / "ko").mkdir()
        shutil.copy2(ROOT / "ko/index.html", dest / "ko/index.html")
        for file in ("index.html", "edit.html", "404.html", ".nojekyll"):
            shutil.copy2(ROOT / file, dest / file)
    print(f"Built English homepage, {len(data['publications'])} publications. " + (f"Public output: {output}" if output else ""))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", help="Optional public-only deployment directory")
    build(parser.parse_args().output)
