{
  "rules": [
    {{- $firstRule := true }}
    {{- range . }}
      {{- range .Vulnerabilities }}
        {{- if $firstRule }}{{ $firstRule = false }}{{ else }},{{ end }}
        {
          "id": {{ printf "%q" .VulnerabilityID }},
          "name": {{ printf "%q" .Title }},
          "description": {{ printf "%q" (printf "OVERVIEW\n• CVE ID: %s\n• Severity: %s\n• Package: %s\n• Installed Version: %s\n• Fixed Version: %s\n\nDESCRIPTION\n%s\n\nREMEDIATION\nUpgrade the package to version %s or later to resolve this vulnerability." .VulnerabilityID .Severity (.PkgName | default "Unknown") (.InstalledVersion | default "Unknown") (.FixedVersion | default "latest") (.Description | default "No description available") (.FixedVersion | default "latest")) }},
          "engineId": "trivy",
          "cleanCodeAttribute": "TRUSTWORTHY",
          "type": "VULNERABILITY",
          "severity": {{ if eq .Severity "CRITICAL" }}"BLOCKER"{{ else if eq .Severity "HIGH" }}"CRITICAL"{{ else if eq .Severity "MEDIUM" }}"MAJOR"{{ else }}"MINOR"{{ end }},
          "impacts": [
            {
              "softwareQuality": "SECURITY",
              "severity": {{ if eq .Severity "CRITICAL" }}"BLOCKER"{{ else if eq .Severity "HIGH" }}"HIGH"{{ else if eq .Severity "MEDIUM" }}"MEDIUM"{{ else }}"LOW"{{ end }}
            }
          ]
        }
      {{- end }}
      {{- range .Misconfigurations }}
        {{- if $firstRule }}{{ $firstRule = false }}{{ else }},{{ end }}
        {
          "id": {{ printf "%q" .ID }},
          "name": {{ printf "%q" .Title }},
          "description": {{ printf "%q" (printf "OVERVIEW\n• Rule ID: %s\n• Severity: %s\n• Type: %s\n• Status: %s\n\nDESCRIPTION\n%s\n\nREMEDIATION\n%s" .ID .Severity (.Type | default "Misconfiguration") (.Status | default "FAIL") (.Description | default "No description available") (.Resolution | default "Review and fix the configuration according to security best practices")) }},
          "engineId": "trivy",
          "cleanCodeAttribute": "TRUSTWORTHY",
          "type": "VULNERABILITY",
          "severity": {{ if eq .Severity "CRITICAL" }}"BLOCKER"{{ else if eq .Severity "HIGH" }}"CRITICAL"{{ else if eq .Severity "MEDIUM" }}"MAJOR"{{ else }}"MINOR"{{ end }},
          "impacts": [
            {
              "softwareQuality": "SECURITY",
              "severity": {{ if eq .Severity "CRITICAL" }}"BLOCKER"{{ else if eq .Severity "HIGH" }}"HIGH"{{ else if eq .Severity "MEDIUM" }}"MEDIUM"{{ else }}"LOW"{{ end }}
            }
          ]
        }
      {{- end }}
      {{- range .Secrets }}
        {{- if $firstRule }}{{ $firstRule = false }}{{ else }},{{ end }}
        {
          "id": {{ printf "%q" .RuleID }},
          "name": {{ printf "%q" .Title }},
          "description": {{ printf "%q" (printf "OVERVIEW\n• Secret Type: %s\n• Severity: %s\n• Category: %s\n\nWARNING\nA potential secret or credential has been detected in the codebase. This could expose sensitive information if committed to version control.\n\nACTION REQUIRED\n1. Verify if this is a real secret or a false positive\n2. If it's a real secret, immediately rotate the credential\n3. Remove the secret from the codebase\n4. Use environment variables or a secrets management service instead" .RuleID .Severity (.Category | default "Unknown")) }},
          "engineId": "trivy",
          "cleanCodeAttribute": "TRUSTWORTHY",
          "type": "VULNERABILITY",
          "severity": {{ if eq .Severity "CRITICAL" }}"BLOCKER"{{ else if eq .Severity "HIGH" }}"CRITICAL"{{ else if eq .Severity "MEDIUM" }}"MAJOR"{{ else }}"MINOR"{{ end }},
          "impacts": [
            {
              "softwareQuality": "SECURITY",
              "severity": {{ if eq .Severity "CRITICAL" }}"BLOCKER"{{ else if eq .Severity "HIGH" }}"HIGH"{{ else if eq .Severity "MEDIUM" }}"MEDIUM"{{ else }}"LOW"{{ end }}
            }
          ]
        }
      {{- end }}
      {{- range .Licenses }}
        {{- if $firstRule }}{{ $firstRule = false }}{{ else }},{{ end }}
        {
          "id": {{ printf "%q" (.Name | default "unknown-license") }},
          "name": {{ printf "%q" (printf "License: %s" (.Name | default "Unknown")) }},
          "description": {{ printf "%q" (printf "OVERVIEW\n• License: %s\n• Severity: %s\n• Category: %s\n\nDESCRIPTION\nThis dependency uses a license that may not be compatible with your project's licensing requirements or organizational policies.\n\nACTION REQUIRED\nReview the license terms and ensure compliance with your organization's licensing policy." (.Name | default "Unknown") .Severity (.Category | default "License compliance issue")) }},
          "engineId": "trivy",
          "cleanCodeAttribute": "TRUSTWORTHY",
          "type": "VULNERABILITY",
          "severity": {{ if eq .Severity "CRITICAL" }}"BLOCKER"{{ else if eq .Severity "HIGH" }}"CRITICAL"{{ else if eq .Severity "MEDIUM" }}"MAJOR"{{ else }}"MINOR"{{ end }},
          "impacts": [
            {
              "softwareQuality": "SECURITY",
              "severity": {{ if eq .Severity "CRITICAL" }}"BLOCKER"{{ else if eq .Severity "HIGH" }}"HIGH"{{ else if eq .Severity "MEDIUM" }}"MEDIUM"{{ else }}"LOW"{{ end }}
            }
          ]
        }
      {{- end }}
    {{- end }}
  ],
  "issues": [
    {{- $firstIssue := true }}
    {{- range . }}
      {{- $target := .Target }}
      {{- range .Vulnerabilities }}
        {{- if $firstIssue }}{{ $firstIssue = false }}{{ else }},{{ end }}
        {
          "ruleId": {{ printf "%q" .VulnerabilityID }},
          "primaryLocation": {
            "message": {{ printf "%q" (printf "%s [%s]" .Title .VulnerabilityID) }},
            "filePath": {{ printf "%q" $target }},
            "textRange": {
              "startLine": 1
            }
          }
        }
      {{- end }}
      {{- range .Misconfigurations }}
        {{- $line := 1 }}
        {{- if and .CauseMetadata .CauseMetadata.StartLine }}{{ $line = .CauseMetadata.StartLine }}{{ end }}
        {{- if $firstIssue }}{{ $firstIssue = false }}{{ else }},{{ end }}
        {
          "ruleId": {{ printf "%q" .ID }},
          "primaryLocation": {
            "message": {{ printf "%q" (printf "%s [%s]" .Title .ID) }},
            "filePath": {{ printf "%q" $target }},
            "textRange": {
              "startLine": {{ $line }}
            }
          }
        }
      {{- end }}
      {{- range .Secrets }}
        {{- $line := 1 }}
        {{- if .StartLine }}{{ $line = .StartLine }}{{ end }}
        {{- if $firstIssue }}{{ $firstIssue = false }}{{ else }},{{ end }}
        {
          "ruleId": {{ printf "%q" .RuleID }},
          "primaryLocation": {
            "message": {{ printf "%q" (printf "Secret detected: %s" .Title) }},
            "filePath": {{ printf "%q" $target }},
            "textRange": {
              "startLine": {{ $line }}
            }
          }
        }
      {{- end }}
      {{- range .Licenses }}
        {{- if $firstIssue }}{{ $firstIssue = false }}{{ else }},{{ end }}
        {
          "ruleId": {{ printf "%q" (.Name | default "unknown-license") }},
          "primaryLocation": {
            "message": {{ printf "%q" (printf "License: %s" (.Name | default "Unknown")) }},
            "filePath": {{ printf "%q" $target }},
            "textRange": {
              "startLine": 1
            }
          }
        }
      {{- end }}
    {{- end }}
  ]
}