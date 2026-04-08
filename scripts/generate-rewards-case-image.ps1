Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$sourceRoot = "C:\Users\gehar\Documents\Github\siriseeds-rewards\assets"
$outputDir = Join-Path $repoRoot "assets\work\rewards-loyalty-program"
$outputPath = Join-Path $outputDir "RewardsLoyalty_1.png"

if (!(Test-Path $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir | Out-Null
}

function New-Color([int]$r, [int]$g, [int]$b, [int]$a = 255) {
  return [System.Drawing.Color]::FromArgb($a, $r, $g, $b)
}

function New-RoundedRectPath([float]$x, [float]$y, [float]$width, [float]$height, [float]$radius) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $radius * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Fill-RoundedRect($graphics, $brush, [float]$x, [float]$y, [float]$width, [float]$height, [float]$radius) {
  $path = New-RoundedRectPath $x $y $width $height $radius
  try {
    $graphics.FillPath($brush, $path)
  } finally {
    $path.Dispose()
  }
}

function Draw-CenteredString($graphics, [string]$text, $font, $brush, [float]$x, [float]$y, [float]$width, [float]$height) {
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  try {
    $graphics.DrawString($text, $font, $brush, [System.Drawing.RectangleF]::new($x, $y, $width, $height), $format)
  } finally {
    $format.Dispose()
  }
}

function Draw-CardIcon($graphics, [string]$fileName, [float]$x, [float]$y, [float]$width, [float]$height) {
  $path = Join-Path $sourceRoot $fileName
  $image = [System.Drawing.Image]::FromFile($path)
  try {
    $sourceHeight = [Math]::Floor($image.Height * 0.48)
    $srcRect = [System.Drawing.Rectangle]::new(0, 0, $image.Width, $sourceHeight)
    $destRect = [System.Drawing.RectangleF]::new($x, $y, $width, $height)
    $graphics.DrawImage($image, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  } finally {
    $image.Dispose()
  }
}

$bitmap = New-Object System.Drawing.Bitmap 1600, 980
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

try {
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $background = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    [System.Drawing.Point]::new(0, 0),
    [System.Drawing.Point]::new(1600, 980),
    (New-Color 9 20 28),
    (New-Color 34 89 66)
  )
  $graphics.FillRectangle($background, 0, 0, 1600, 980)
  $background.Dispose()

  $glowBrush1 = New-Object System.Drawing.SolidBrush (New-Color 118 191 91 52)
  $graphics.FillEllipse($glowBrush1, -120, -120, 620, 620)
  $glowBrush1.Dispose()

  $glowBrush2 = New-Object System.Drawing.SolidBrush (New-Color 31 140 176 46)
  $graphics.FillEllipse($glowBrush2, 1060, 120, 420, 420)
  $glowBrush2.Dispose()

  $screenShadow = New-Object System.Drawing.SolidBrush (New-Color 0 0 0 52)
  Fill-RoundedRect $graphics $screenShadow 148 118 462 744 46
  $screenShadow.Dispose()

  $phoneBrush = New-Object System.Drawing.SolidBrush (New-Color 15 24 31)
  Fill-RoundedRect $graphics $phoneBrush 130 96 462 744 46
  $phoneBrush.Dispose()

  $screenBrush = New-Object System.Drawing.SolidBrush (New-Color 248 250 245)
  Fill-RoundedRect $graphics $screenBrush 150 116 422 704 36
  $screenBrush.Dispose()

  $notchBrush = New-Object System.Drawing.SolidBrush (New-Color 15 24 31)
  Fill-RoundedRect $graphics $notchBrush 295 132 132 18 9
  $notchBrush.Dispose()

  $titleBrush = New-Object System.Drawing.SolidBrush (New-Color 16 28 31)
  $subBrush = New-Object System.Drawing.SolidBrush (New-Color 91 104 110)
  $chipBrush = New-Object System.Drawing.SolidBrush (New-Color 232 245 223)
  $chipTextBrush = New-Object System.Drawing.SolidBrush (New-Color 52 96 39)
  $cardBrush = New-Object System.Drawing.SolidBrush (New-Color 255 255 255)
  $cardShadow = New-Object System.Drawing.SolidBrush (New-Color 0 0 0 20)
  $maskBrush = New-Object System.Drawing.SolidBrush (New-Color 233 238 229)
  $mutedBrush = New-Object System.Drawing.SolidBrush (New-Color 100 108 111)
  $accentBrush = New-Object System.Drawing.SolidBrush (New-Color 118 191 91)
  $whiteBrush = New-Object System.Drawing.SolidBrush (New-Color 255 255 255)
  $rightCardBrush = New-Object System.Drawing.SolidBrush (New-Color 255 255 255 242)
  $rightCardText = New-Object System.Drawing.SolidBrush (New-Color 18 31 34)
  $rightCardSub = New-Object System.Drawing.SolidBrush (New-Color 89 105 109)

  $titleFont = New-Object System.Drawing.Font("Segoe UI Semibold", 24)
  $subFont = New-Object System.Drawing.Font("Segoe UI", 12)
  $chipFont = New-Object System.Drawing.Font("Segoe UI Semibold", 10)
  $cardTitleFont = New-Object System.Drawing.Font("Segoe UI Semibold", 15)
  $cardBodyFont = New-Object System.Drawing.Font("Segoe UI", 9)
  $heroLabelFont = New-Object System.Drawing.Font("Segoe UI Semibold", 14)
  $heroTitleFont = New-Object System.Drawing.Font("Segoe UI Semibold", 30)
  $heroBodyFont = New-Object System.Drawing.Font("Segoe UI", 15)
  $pillFont = New-Object System.Drawing.Font("Segoe UI Semibold", 12)

  $graphics.DrawString("Rewards & Loyalty", $titleFont, $titleBrush, 184, 182)
  $graphics.DrawString("Field-ready journeys with geo validation and secure redemptions", $subFont, $subBrush, [System.Drawing.RectangleF]::new(184, 224, 330, 48))

  Fill-RoundedRect $graphics $chipBrush 184 280 116 30 15
  Draw-CenteredString $graphics "Geo-aware" $chipFont $chipTextBrush 184 280 116 30
  Fill-RoundedRect $graphics $chipBrush 310 280 112 30 15
  Draw-CenteredString $graphics "QR rewards" $chipFont $chipTextBrush 310 280 112 30

  $cards = @(
    @{
      X = 184; Y = 338; W = 354; H = 122;
      File = "Retailer Onboarding-optimized.png";
      Title = "Dealer onboarding";
      Body = "Enrollment flow for channel partners with structured campaign entry points."
    },
    @{
      X = 184; Y = 480; W = 354; H = 122;
      File = "Farmer Onboarding-optimized.png";
      Title = "Field engagement";
      Body = "Farmer journeys tied to field activity, product touchpoints, and campaign participation."
    },
    @{
      X = 184; Y = 622; W = 354; H = 122;
      File = "Retailor Point-optimized.png";
      Title = "Reward redemption";
      Body = "Points claims with stronger redemption controls and clearer audit trails."
    }
  )

  foreach ($card in $cards) {
    Fill-RoundedRect $graphics $cardShadow ($card.X + 4) ($card.Y + 8) $card.W $card.H 26
    Fill-RoundedRect $graphics $cardBrush $card.X $card.Y $card.W $card.H 26
    Draw-CardIcon $graphics $card.File ($card.X + 16) ($card.Y + 12) 94 66
    Fill-RoundedRect $graphics $maskBrush ($card.X + 16) ($card.Y + 62) 94 18 9
    Draw-CenteredString $graphics "Brand masked" $chipFont $mutedBrush ($card.X + 16) ($card.Y + 62) 94 18
    $graphics.DrawString($card.Title, $cardTitleFont, $titleBrush, ($card.X + 126), ($card.Y + 24))
    $graphics.DrawString($card.Body, $cardBodyFont, $subBrush, [System.Drawing.RectangleF]::new(($card.X + 126), ($card.Y + 52), 204, 54))
  }

  Fill-RoundedRect $graphics $chipBrush 690 156 144 34 17
  Draw-CenteredString $graphics "AgriTech Platform" $pillFont $chipTextBrush 690 156 144 34

  $graphics.DrawString("Rewards and loyalty campaign.", $heroTitleFont, $whiteBrush, [System.Drawing.RectangleF]::new(690, 212, 700, 138))
  $graphics.DrawString("A field-focused rewards system spanning dealer onboarding, farmer engagement, geo-aware validation, and controlled QR redemption flows.", $heroBodyFont, $whiteBrush, [System.Drawing.RectangleF]::new(690, 352, 660, 74))

  $featureCards = @(
    @{
      X = 690; Y = 474; W = 260; H = 184;
      Title = "Geo validation";
      Body = "Capture check-in location and context before reward actions are committed."
    },
    @{
      X = 970; Y = 474; W = 260; H = 184;
      Title = "QR control";
      Body = "Signed scan journeys designed to reduce duplicate or fraudulent claims."
    },
    @{
      X = 1250; Y = 474; W = 260; H = 184;
      Title = "Campaign ops";
      Body = "Operator visibility into campaign rules, point flows, and redemption states."
    }
  )

  foreach ($feature in $featureCards) {
    Fill-RoundedRect $graphics $rightCardBrush $feature.X $feature.Y $feature.W $feature.H 28
    Fill-RoundedRect $graphics $accentBrush ($feature.X + 24) ($feature.Y + 24) 54 54 18
    $graphics.DrawString($feature.Title, $cardTitleFont, $rightCardText, ($feature.X + 24), ($feature.Y + 96))
    $graphics.DrawString($feature.Body, $cardBodyFont, $rightCardSub, [System.Drawing.RectangleF]::new(($feature.X + 24), ($feature.Y + 122), 208, 54))
  }

  $footerPen = New-Object System.Drawing.Pen (New-Color 255 255 255 54), 1
  $graphics.DrawLine($footerPen, 690, 742, 1510, 742)
  $footerPen.Dispose()

  $graphics.DrawString("Client branding removed for external portfolio use", $heroLabelFont, $whiteBrush, 690, 764)
  $graphics.DrawString("Source imagery adapted from the underlying rewards codebase and sanitized for customer-facing presentation.", $subFont, $whiteBrush, [System.Drawing.RectangleF]::new(690, 796, 700, 40))

  $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $objectsToDispose = @(
    $titleBrush, $subBrush, $chipBrush, $chipTextBrush, $cardBrush, $cardShadow, $maskBrush,
    $mutedBrush, $accentBrush, $whiteBrush, $rightCardBrush, $rightCardText, $rightCardSub,
    $titleFont, $subFont, $chipFont, $cardTitleFont, $cardBodyFont, $heroLabelFont, $heroTitleFont,
    $heroBodyFont, $pillFont
  )

  foreach ($object in $objectsToDispose) {
    if ($null -ne $object) { $object.Dispose() }
  }
} finally {
  $graphics.Dispose()
  $bitmap.Dispose()
}

Write-Output "Generated $outputPath"
