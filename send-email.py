#!/usr/bin/env python3

# This script sends an email using SMTP with enhanced error handling and content type detection.
# this script is intended to be run from a CI/CD pipeline, e.g. Bitbucket Pipelines
# It reads the email body from a file or inline text, detects content type, and sends the email with proper headers.

import os
import sys
import smtplib
import argparse
from email.mime.text import MIMEText

# Main function to parse arguments and send email
def main():
    parser = argparse.ArgumentParser(
        description="Send an email using SMTP. Usage: python sendmail.py FROM TO EMAIL_SUBJECT EMAIL_BODY"
    )
    parser.add_argument('--from_addr', required=True, help='Sender email address')
    parser.add_argument('--to_addr', required=True, help='Recipient email address(es), comma separated')
    parser.add_argument('--email_subject', required=True, help='Email subject')
    parser.add_argument('--email_body', required=True, help='email body as file or inline text (.html or .txt)')

    args = parser.parse_args() # Parse command line arguments

    # load SMTP configuration from environment variables
    smtp_server = os.environ.get('SMTP_SERVER', 'smtp.azurecomm.net')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_user = os.environ['SMTP_USERNAME'] # stored in pipeline open variables
    smtp_pass = os.environ['SMTP_PASSWORD'] # stored in pipeline secrets variables

    # Strict check on credentials
    if not smtp_user or not smtp_pass:
        print("[ERROR] SMTP_USERNAME and SMTP_PASSWORD environment variables must be set.", file=sys.stderr)
        sys.exit(1)

    # build the email message
    body_content = get_body_content(args.email_body)
    content_type = detect_content_type(args.email_body, body_content)
    msg = MIMEText(body_content, content_type, 'utf-8')
    msg['Subject'] = args.email_subject
    msg['From'] = args.from_addr
    msg['To'] = args.to_addr

    recipients = [r.strip() for r in args.to_addr.split(',') if r.strip()]

    # strict check on recipients
    if not recipients:
        print("[ERROR] No recipients specified in TO address.", file=sys.stderr)
        sys.exit(2)

    # send the email using SMTP
    try:
        with smtplib.SMTP(smtp_server, smtp_port, timeout=10) as s:
            s.starttls()
            s.login(smtp_user, smtp_pass)
            s.sendmail(args.from_addr, recipients, msg.as_string())
        print(f"[SUCCESS] Email sent to: {recipients} with subject: {args.email_subject}")
    except Exception as e:
        print(f"[ERROR] Failed to send email: {e}", file=sys.stderr)
        sys.exit(3)

#  If input is a file path and file exists, read its content. Otherwise, treat input as inline text. Returns body_content.
def get_body_content(body_input):

    if os.path.isfile(body_input):
        with open(body_input, encoding="utf-8") as f:
            body_content = f.read()
        print(f"[INFO] Email body loaded from file: {body_input}")
    else:
        body_content = body_input
        print(f"[INFO] Using inline text as email body.")
    return body_content

# Determines content type ('html' or 'plain') based on input file extension, or simple detection for inline HTML.
def detect_content_type(body_input, body_content):

    if os.path.isfile(body_input):
        return 'html' if body_input.lower().endswith('.html') else 'plain'
    # Optional: Inline HTML detection
    if '<html' in body_content.lower() or '<div' in body_content.lower() or '<p' in body_content.lower():
        return 'html'
    return 'plain'

# Entry point for the script
if __name__ == "__main__":
    main()
