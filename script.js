let currentQuestionIndex = 0;
  const questions = document.querySelectorAll('.question');
  const prevButton = document.getElementById('prevButton');
  const nextButton = document.getElementById('nextButton');
  const submitButtonContainer = document.getElementById('submitButtonContainer');
  const surveyContent = document.getElementById('surveyContent');
  const finalMessage = document.getElementById('finalMessage');
  const alreadySubmittedMessage = document.getElementById('alreadySubmittedMessage');

  function getParamsAndCleanURL() {
    const params = new URLSearchParams(window.location.search);

    // Guardar en sessionStorage
    if (params.get('IdUsuario')) {
      sessionStorage.setItem('IdUsuario', params.get('IdUsuario'));
      //sessionStorage.setItem('Nombre', params.get('Nombre'));
      //sessionStorage.setItem('Apellido', params.get('Apellido'));
      //sessionStorage.setItem('Departamento', params.get('Departamento'));
      sessionStorage.setItem('Token', params.get('Token'));
    }

    // Llenar campos ocultos desde sessionStorage
    document.getElementById('IdUsuario').value = sessionStorage.getItem('IdUsuario') || '';
    //document.getElementById('Nombre').value = sessionStorage.getItem('Nombre') || '';
    //document.getElementById('Apellido').value = sessionStorage.getItem('Apellido') || '';
    //document.getElementById('Departamento').value = sessionStorage.getItem('Departamento') || '';
    document.getElementById('Token').value = sessionStorage.getItem('Token') || '';

    // Limpiar los parámetros de la URL sin recargar la página
    if (window.location.search.length > 0) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

// function checkPermissions() {
//   const idUsuario = document.getElementById('IdUsuario').value.trim();
//   const nombre = document.getElementById('Nombre').value.trim();
//   const apellido = document.getElementById('Apellido').value.trim();
//   const departamento = document.getElementById('Departamento').value.trim();
//   const token = document.getElementById('Token').value.trim();

//   if (!idUsuario || !nombre || !apellido || !departamento || !token) {
//     // Ocultar el formulario y botones
//     document.getElementById('surveyContent').style.display = 'none';

//     // Mostrar mensaje de no permisos
//     const noPermissionMsg = document.createElement('div');
//     noPermissionMsg.style.textAlign = 'center';
//     noPermissionMsg.style.color = 'blue';
//     noPermissionMsg.style.padding = '20px';
//     noPermissionMsg.style.border = '1px solid blue';
//     noPermissionMsg.style.borderRadius = '8px';
//     noPermissionMsg.style.marginTop = '20px';
//     noPermissionMsg.textContent = 'No tienes permiso para ver el formulario.Intenta comunicarte con el propietario del formulario si consideras que se trata de un error.';

//     document.querySelector('.survey-container').appendChild(noPermissionMsg);

    // También deshabilitar botones para mayor seguridad
//     document.getElementById('prevButton').disabled = true;
//     document.getElementById('nextButton').disabled = true;

//     return false;
//   }
//   return true;
// }


  function showQuestion(index) {
    questions.forEach((q, i) => {
      q.classList.remove('active', 'error');
      if (i === index) q.classList.add('active');
    });

    prevButton.disabled = index === 0;
    nextButton.style.display = index === questions.length - 1 ? 'none' : 'inline-block';
    submitButtonContainer.style.display = index === questions.length - 1 ? 'block' : 'none';

    attachRadioListeners();
  }

  function isValidAnswer(index) {
    const question = questions[index];
    const inputs = question.querySelectorAll('input, textarea');
    for (let input of inputs) {
      if (input.type === 'radio') {
        const name = input.name;
        if (question.querySelector(`input[name="${name}"]:checked`)) {
          return true;
        }
      } else if (input.tagName.toLowerCase() === 'textarea' && input.value.trim() !== '') {
        return true;
      }
    }
    return false;
  }

  function nextQuestion() {
    if (!isValidAnswer(currentQuestionIndex)) {
      questions[currentQuestionIndex].classList.add('error', 'shake');
      setTimeout(() => questions[currentQuestionIndex].classList.remove('shake'), 500);
      return;
    }
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      showQuestion(currentQuestionIndex);
    }
  }

  function prevQuestion() {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      showQuestion(currentQuestionIndex);
    }
  }

  function submitSurvey() {
  if (!isValidAnswer(currentQuestionIndex)) {
    questions[currentQuestionIndex].classList.add('error', 'shake');
    setTimeout(() => questions[currentQuestionIndex].classList.remove('shake'), 500);
    return;
  }

  const form = document.getElementById("EncuestaDesempeno");
  const formData = new FormData(form);

  fetch(form.action, {
    method: "POST",
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error al enviar la encuesta');
    }
    return response.text();
  })
  .then(data => {
    surveyContent.style.display = 'none';
    finalMessage.style.display = 'block';

    // Marca que ya respondió
    localStorage.setItem('encuestaCompletada', 'true');
  })
  .catch(error => {
    alert("Ocurrió un error al enviar la encuesta. Intenta nuevamente.");
    console.error(error);
  });
}


  function attachRadioListeners() {
    const radios = questions[currentQuestionIndex].querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
      radio.onclick = () => {
        if (isValidAnswer(currentQuestionIndex)) {
          setTimeout(() => nextQuestion(), 200);
        }
      };
    });
  }

  window.onload = () => {
  getParamsAndCleanURL();

  // if (!checkPermissions()) {
  //   // No permisos, no continuar
  //   return;
  // }

  if (localStorage.getItem('encuestaCompletada') === 'true') {
    surveyContent.style.display = 'none';
    alreadySubmittedMessage.style.display = 'block';
  } else {
    showQuestion(currentQuestionIndex);
  }
};
