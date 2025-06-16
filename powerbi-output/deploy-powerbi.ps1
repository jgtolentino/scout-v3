
# Power BI Deployment Script for Scout Dashboard
# Generated on 2025-06-13T05:15:52.751Z

# Prerequisites:
# 1. Install Power BI CLI: https://docs.microsoft.com/en-us/power-bi/developer/automation/overview-of-power-bi-rest-api
# 2. Azure CLI installed and authenticated
# 3. Power BI Pro license

# Variables
$WorkspaceName = "Scout MVP Insights"
$ReportName = "Scout Dashboard"
$DatasetName = "ScoutAnalyticsDataset"
$TemplateFile = "./scout-powerbi-template.json"

# Authenticate to Power BI
Write-Host "Authenticating to Power BI..."
Connect-PowerBIServiceAccount

# Create workspace if it doesn't exist
Write-Host "Creating workspace: $WorkspaceName"
try {
    $workspace = Get-PowerBIWorkspace -Name $WorkspaceName
    Write-Host "Workspace exists: $($workspace.Id)"
} catch {
    $workspace = New-PowerBIWorkspace -Name $WorkspaceName
    Write-Host "Created new workspace: $($workspace.Id)"
}

# Import dataset and report
Write-Host "Importing Power BI template..."
$import = New-PowerBIImport -Path $TemplateFile -WorkspaceId $workspace.Id -ConflictAction "CreateOrOverwrite"

Write-Host "Import completed. Report ID: $($import.Id)"

# Configure data source credentials
Write-Host "Configuring data source credentials..."
$dataSourceId = (Get-PowerBIDataset -WorkspaceId $workspace.Id -Name $DatasetName).Id

# Note: You'll need to set up credentials manually in the Power BI service
# or use the REST API to configure them programmatically

Write-Host "Deployment completed!"
Write-Host "Workspace: $WorkspaceName"
Write-Host "Report: $ReportName"
Write-Host "Please configure data source credentials in Power BI Service"
