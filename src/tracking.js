export const googleAdsId = 'AW-981431498';
export const enquiryConversionId = 'AW-981431498/YbPjCI7E-4QdEMrp_dMD';

export const googleAdsHead = `<!-- GOOGLE_ADS_START -->
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${googleAdsId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${googleAdsId}', {send_page_view: false});
  gtag('event', 'page_view', {send_to: '${googleAdsId}'});
</script>
<!-- GOOGLE_ADS_END -->`;

export function trackEnquiryConversion() {
  // Tracking failures must not turn an accepted enquiry into a form error.
  try {
    window.gtag?.('event', 'conversion', {send_to: enquiryConversionId});
  } catch {
    // The enquiry remains successful if tracking is blocked or unavailable.
  }
}
