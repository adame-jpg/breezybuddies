#!/usr/bin/env python3
"""Generate the supporting pages (policies, contact, checklist) from one shell.

The storefront ships as plain static files, so these are written to disk rather
than templated at runtime. Edit the CONTENT below and re-run.
"""
from __future__ import annotations

from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "pages"

SHELL = """<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#fff8ee" />
    <title>{title} | BreezyBuddies</title>
    <meta name="description" content="{description}" />
    <meta name="robots" content="{robots}" />
    <link rel="canonical" href="https://breezybuddies.com/pages/{slug}.html" />
    <link rel="icon" href="../assets/img/brand/favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito+Sans:wght@400;600;700&display=swap" />
    <link rel="stylesheet" href="../assets/css/tokens.css" />
    <link rel="stylesheet" href="../assets/css/base.css" />
    <link rel="stylesheet" href="../assets/css/components.css" />
  </head>

  <body data-page="{page}">
    <a class="skip" href="#main" data-i18n="a11y.skip">Skip to content</a>
    <div id="site-header"></div>

    <main id="main" class="doc">
      <div class="wrap wrap--narrow">
        <a class="doc__back" href="../index.html" data-i18n="page.back">Back to shop</a>
        <h1>{heading}</h1>
{draft}{body}
      </div>
{extra}
    </main>

    <footer class="footer" id="site-footer"></footer>
    <script type="module" src="../assets/js/app.js"></script>
  </body>
</html>
"""

DRAFT = '        <p class="doc__draft" data-i18n="page.draft">Draft text — needs a legal review before launch.</p>\n'

TODO = '<span class="doc__todo">TODO</span>'


def page(
    slug: str,
    title: str,
    heading: str,
    description: str,
    body: str,
    *,
    draft: bool = True,
    page_type: str = "static",
    robots: str = "index,follow",
    extra: str = "",
) -> None:
    html = SHELL.format(
        slug=slug,
        title=title,
        heading=heading,
        description=description,
        body=body.rstrip("\n"),
        draft=DRAFT if draft else "",
        page=page_type,
        robots=robots,
        extra=extra,
    )
    (OUT / f"{slug}.html").write_text(html, encoding="utf-8")
    print(f"ok  pages/{slug}.html")


OUT.mkdir(parents=True, exist_ok=True)

page(
    "faq",
    "FAQ",
    "Questions, answered",
    "Everything we know about the BreezyBuddy, and an honest note where we are still waiting on the supplier.",
    "",
    draft=False,
    page_type="faq",
    extra='      <section class="section section--cream" id="faq"></section>\n'
    '      <section class="section section--white section--tight" id="trust"></section>\n',
)

page(
    "shipping",
    "Shipping",
    "Shipping",
    "Delivery times, shipping costs and tracking for BreezyBuddies orders.",
    f"""
        <h2>Processing</h2>
        <p>Orders are picked and handed to the carrier within 1–2 business days.</p>

        <h2>Delivery times</h2>
        <ul>
          <li>EU: <strong data-ship-eu>6–12</strong> business days</li>
          <li>UK, US, Canada, Australia: 7–16 business days</li>
          <li>Rest of world: <strong data-ship-row>10–20</strong> business days</li>
        </ul>
        <p>These are estimates based on the fulfilment route, not guarantees. {TODO} — confirm real
          transit times with the fulfilment partner and replace this paragraph with contractual windows.</p>

        <h2>Shipping cost</h2>
        <p>Shipping is free on orders of two buddies or more. Single-buddy orders are charged a flat
          rate shown at checkout. {TODO} — set the exact flat rate per region.</p>

        <h2>Tracking</h2>
        <p>You receive a tracking link by email as soon as the parcel is scanned by the carrier.</p>

        <h2>Import duties</h2>
        <p>{TODO} — confirm who pays import duties per market (EU IOSS, UK VAT, US de minimis) before
          advertising outside the EU.</p>
""",
)

page(
    "returns",
    "Returns",
    "Returns &amp; refunds",
    "How to return a BreezyBuddy and how refunds are handled.",
    f"""
        <h2>Your right to change your mind</h2>
        <p>You can return an unused BreezyBuddy within <strong data-returns-days>30</strong> days of
          delivery. EU customers also keep their statutory 14-day right of withdrawal, which this
          policy sits on top of.</p>

        <h2>Condition</h2>
        <p>Please send it back in its original packaging, complete and undamaged.</p>

        <h2>How to start a return</h2>
        <p>Email <a href="mailto:hello@breezybuddies.com">hello@breezybuddies.com</a> with your order
          number and we reply with the return address and instructions.</p>

        <h2>Return shipping</h2>
        <p>{TODO} — decide who pays return postage and state it here plainly.</p>

        <h2>Refunds</h2>
        <p>Once the parcel arrives we refund to the original payment method. Banks usually show the
          money within 5–10 business days.</p>

        <h2>Damaged on arrival</h2>
        <p>Send a photo and we replace it or refund you — no return needed.</p>
""",
)

page(
    "privacy",
    "Privacy Policy",
    "Privacy policy",
    "What data BreezyBuddies collects, why, and how to have it removed.",
    f"""
        <h2>Who we are</h2>
        <p>{TODO} — registered company name, address and (if required) the data protection contact.</p>

        <h2>What we collect</h2>
        <ul>
          <li>Order details: name, delivery address, email, phone if you give it.</li>
          <li>Payment status only. Card details never reach our servers.</li>
          <li>Newsletter email address, if you sign up.</li>
          <li>Anonymous usage statistics, once analytics is switched on.</li>
        </ul>

        <h2>Why</h2>
        <p>To ship your order, to answer your questions, to meet accounting obligations, and to
          understand which pages people find useful.</p>

        <h2>Who we share it with</h2>
        <p>{TODO} — list the actual processors: commerce platform, payment provider, fulfilment
          partner, email tool, analytics. A processor list is required under the GDPR.</p>

        <h2>How long we keep it</h2>
        <p>Order records for as long as tax law requires. Newsletter data until you unsubscribe.</p>

        <h2>Your rights</h2>
        <p>You can ask for a copy of your data, a correction, or its deletion. Email
          <a href="mailto:hello@breezybuddies.com">hello@breezybuddies.com</a> and we answer within
          one month.</p>
""",
)

page(
    "terms",
    "Terms",
    "Terms &amp; conditions",
    "The terms that apply when you order from BreezyBuddies.",
    f"""
        <h2>Seller</h2>
        <p>{TODO} — legal entity, registered address, company and VAT number. This is mandatory for
          EU distance selling.</p>

        <h2>Prices</h2>
        <p>Prices include VAT where applicable. Shipping is shown before you pay.</p>

        <h2>Orders</h2>
        <p>A contract exists once we confirm your order by email. If an item turns out to be
          unavailable we cancel and refund in full.</p>

        <h2>Product use</h2>
        <p>A BreezyBuddy is a small household gadget, not a safety device. It moves air across a warm
          drink or meal. Always supervise young children around hot drinks.</p>

        <h2>Liability</h2>
        <p>{TODO} — have a lawyer set the liability wording for the markets you sell in.</p>

        <h2>Applicable law</h2>
        <p>{TODO} — governing law and competent court.</p>
""",
)

page(
    "cookies",
    "Cookies",
    "Cookie policy",
    "Which cookies BreezyBuddies uses and how to control them.",
    f"""
        <h2>Strictly necessary</h2>
        <p>We store your basket, chosen country, language and currency in your browser so the shop
          remembers them. This is not shared with anyone.</p>

        <h2>Analytics and advertising</h2>
        <p>No analytics or advertising tags are active in this preview. Once they are switched on
          this page must list each one with its purpose and retention.</p>
        <p>{TODO} — add a consent banner before enabling any marketing tag in the EU/UK.</p>

        <h2>Controlling cookies</h2>
        <p>You can clear site data at any time in your browser settings.</p>
""",
)

page(
    "contact",
    "Contact",
    "Contact us",
    "Get in touch with the BreezyBuddies team.",
    f"""
        <h2>Email</h2>
        <p><a href="mailto:hello@breezybuddies.com">hello@breezybuddies.com</a> — a person answers,
          usually within one business day.</p>

        <h2>Order questions</h2>
        <p>Add your order number and we can look it up straight away.</p>

        <h2>Press and collaborations</h2>
        <p>Same address, put “press” in the subject line.</p>

        <h2>Business details</h2>
        <p>{TODO} — company name, address, VAT number and phone number if you want one listed.</p>
""",
    draft=False,
)

page(
    "track-order",
    "Track your order",
    "Track your order",
    "Follow your BreezyBuddies parcel.",
    """
        <p>Enter the order number from your confirmation email and we will show the latest carrier
          scan.</p>

        <form class="news__form" style="margin-inline:0" onsubmit="event.preventDefault();
             this.nextElementSibling.hidden = false;">
          <label class="visually-hidden" for="order-no">Order number</label>
          <input id="order-no" type="text" name="order" placeholder="BB-12345" autocomplete="off" />
          <button type="submit" class="btn btn--primary btn--lg">Track</button>
        </form>
        <p class="doc__draft" hidden>
          Tracking is not connected in this preview. On the live shop this form talks to the carrier
          lookup of the commerce platform.
        </p>

        <h2>No confirmation email?</h2>
        <p>Check your spam folder, then email
          <a href="mailto:hello@breezybuddies.com">hello@breezybuddies.com</a> and we will resend it.</p>
""",
    draft=False,
)

page(
    "about",
    "About us",
    "Two parents, one very slow cup of tea",
    "Why we started BreezyBuddies.",
    """
        <p>BreezyBuddies started at our own kitchen table. After school there is always the same
          moment: a warm drink is poured, and then everybody waits. Blowing on it is boring. Waiting
          is worse.</p>

        <p>So we went looking for something small, cute and useful enough to make that moment fun —
          a little character that sits on the edge of the mug and sends a soft breeze across the top
          while the kids talk about their day.</p>

        <p>We are a small independent shop. We pick the characters, we answer the emails, and we only
          claim things about the product that we can actually back up. Where we are still waiting on
          test reports from our supplier, we say so instead of making a number up.</p>

        <h2>What we care about</h2>
        <ul>
          <li>Honest product copy, even when it is less exciting.</li>
          <li>Answering messages like a person, not a template.</li>
          <li>Small things that make an ordinary afternoon a bit nicer.</li>
        </ul>
""",
    draft=False,
)

CHECK_ITEMS = [
    ("Company &amp; legal", "Register the business, then fill in every TODO in assets/js/config.js and the policy pages: legal name, address, VAT, governing law, liability."),
    ("Product certification", "Request CE / EN71 toy certification, BPA documentation and an IP rating from the supplier. Until they arrive, the age, waterproof and material claims stay hidden."),
    ("Battery runtime", "Charge a sample, time it, then set CLAIMS.batteryMinutes. The FAQ answer switches on automatically."),
    ("Real photography", "Replace the generated art in assets/img with your own product and lifestyle shots, plus 9:16 video for the Breezy moments reel."),
    ("Reviews", "Set IS_SAMPLE_REVIEWS to false only once real reviews exist in a review app. The sample cards and the sample label disappear together."),
    ("Pricing &amp; currency", "Move pricing to the commerce platform (Shopify Markets or a WooCommerce multi-currency plugin) and drop the placeholder rates in config.js."),
    ("Payments &amp; checkout", "Connect a payment provider, then set PREVIEW_MODE to false so the checkout button works."),
    ("Shipping", "Confirm real transit times and the flat shipping rate per region, and decide who pays import duties."),
    ("Analytics", "Add the GA4, Meta, TikTok and Pinterest IDs in config.js and put a consent banner in front of them for EU/UK traffic."),
    ("Domain &amp; email", "Point the domain at the host, set up hello@ forwarding and add SPF/DKIM before sending newsletters."),
    ("Trademark check", "Check that the BreezyBuddies name is free in your markets before printing anything, and drop the ™ until it is registered."),
]

page(
    "launch-checklist",
    "Pre-launch checklist",
    "Before this shop takes a real order",
    "Internal checklist of everything that still needs real business information.",
    "\n".join(
        [
            '        <p>This page is for us, not for customers. It is not linked from the storefront.</p>',
            '        <div class="check">',
            *[
                f"""          <div class="check__item">
            <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4"/></svg>
            <div><strong>{title}</strong><span>{text}</span></div>
          </div>"""
                for title, text in CHECK_ITEMS
            ],
            "        </div>",
        ]
    ),
    draft=False,
    robots="noindex,nofollow",
)
