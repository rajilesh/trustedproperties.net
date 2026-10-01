export function initEnquiry() {
  const $ = selector => document.querySelector(selector);
  const form = $('#enquiryForm');
  if (!form) return;

  const developerField = $('#developer');
  const requestedDeveloper = new URLSearchParams(window.location.search).get('developer');
  const propertyDeveloper = $('[data-property-developer]')?.dataset.propertyDeveloper;
  const options = [...developerField.options];
  const selectedDeveloper = options.some(option => option.value === requestedDeveloper)
    ? requestedDeveloper
    : propertyDeveloper;
  if (options.some(option => option.value === selectedDeveloper)) developerField.value = selectedDeveloper;

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if ($('#submitButton').disabled) return;

    const payload = {
      name: $('#name').value.trim(),
      countryCode: $('#countryCode').value,
      mobile: $('#mobile').value.trim(),
      email: $('#email').value.trim(),
      developer: $('#developer').value,
      configuration: $('#configuration').value,
      budget: $('#budget').value,
      consent: $('#consent').checked,
    };
    if (!payload.name) {
      $('#name').setCustomValidity('Please enter your name.');
      $('#name').reportValidity();
      return;
    }

    const button = $('#submitButton');
    const message = $('#formMessage');
    button.disabled = true;
    button.textContent = 'Submitting…';
    form.setAttribute('aria-busy', 'true');
    message.textContent = '';
    message.removeAttribute('data-state');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('https://trustedproperties-form.rajileshpanoli123.workers.dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(typeof result?.error === 'string' ? result.error : 'Unable to submit your enquiry. Please try again.');
      }
      message.textContent = 'Thank you! Your enquiry has been submitted successfully. We look forward to helping you find your home.';
      message.dataset.state = 'success';
      form.reset();
      $('#project-interest').hidden = true;
    } catch (error) {
      message.textContent = error.name === 'AbortError'
        ? 'The request timed out and we could not confirm submission. Please wait a moment before trying again.'
        : error instanceof TypeError
          ? 'We couldn’t connect to the enquiry service. Please check your connection and try again.'
          : error.message || 'Something went wrong. Please try again.';
      message.dataset.state = 'error';
    } finally {
      clearTimeout(timeout);
      button.disabled = false;
      button.innerHTML = 'Get details now <span>↗</span>';
      form.removeAttribute('aria-busy');
    }
  });

  $('#name').addEventListener('input', () => $('#name').setCustomValidity(''));
}
