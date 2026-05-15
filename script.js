// REMO - Form Logic
let currentStep = 1;
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwMIagIfc1mhnlH4fVXQ70EqIr9jgc3EynFGcrXFi5r-Ih78HAwSbgWRNSoySVcbveGHg/exec';
document.addEventListener('DOMContentLoaded', function() {
    initForm();
    setupUploads();
    setupRadios();
});

function initForm() {
    updateStepNumber();
    
    document.querySelectorAll('input[name="quantidadeNF"]').forEach(radio => {
        radio.addEventListener('change', function() {
            updateNFSections();
            updateRadioActive(this);
        });
    });
}

function nextStep() {
    if (!validateStep1()) return;
    
    currentStep++;
    updateSteps();
    updateStepNumber();
    updateNFDescription();
    updateNFSections();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep() {
    currentStep--;
    updateSteps();
    updateStepNumber();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateSteps() {
    document.querySelectorAll('.step').forEach((step, i) => {
        step.classList.toggle('active', i + 1 === currentStep);
    });
}

function updateStepNumber() {
    document.getElementById('stepNum').textContent = '0' + currentStep;
}

function validateStep1() {
    const codigo = document.getElementById('codigoCampanha').value.trim();
    const creator = document.getElementById('creator').value.trim();
    
    if (!codigo) {
        alert('Preencha o código da campanha');
        return false;
    }
    if (!creator) {
        alert('Preencha o @creator');
        return false;
    }
    return true;
}

function validateStep2() {
    const quantidadeNF = document.querySelector('input[name="quantidadeNF"]:checked').value;
    
    const banco1 = document.getElementById('banco1').value.trim();
    const titular1 = document.getElementById('titular1').value.trim();
    const chavePix1 = document.getElementById('chavePix1').value.trim();
    const arquivo1 = document.getElementById('arquivo1').files[0];
    
    if (!banco1 || !titular1 || !chavePix1 || !arquivo1) {
        alert('Preencha todos os campos da Nota Fiscal 1');
        return false;
    }
    
    if (arquivo1.size > 10 * 1024 * 1024) {
        alert('Arquivo da NF1 excede 10 MB');
        return false;
    }
    
    if (quantidadeNF === '2 Notas Fiscais') {
        const banco2 = document.getElementById('banco2').value.trim();
        const titular2 = document.getElementById('titular2').value.trim();
        const chavePix2 = document.getElementById('chavePix2').value.trim();
        const arquivo2 = document.getElementById('arquivo2').files[0];
        
        if (!banco2 || !titular2 || !chavePix2 || !arquivo2) {
            alert('Preencha todos os campos da Nota Fiscal 2');
            return false;
        }
        
        if (arquivo2.size > 10 * 1024 * 1024) {
            alert('Arquivo da NF2 excede 10 MB');
            return false;
        }
    }
    
    return true;
}

function updateNFDescription() {
    const codigo = document.getElementById('codigoCampanha').value;
    const creator = document.getElementById('creator').value;
    
    const desc = `Cliente: [marca da campanha ${codigo}]
Creator: ${creator}
Código: ${codigo}
Dados bancários: [será preenchido]`;
    
    document.getElementById('descricaoNF').textContent = desc;
}

function updateNFSections() {
    const quantidadeNF = document.querySelector('input[name="quantidadeNF"]:checked').value;
    const nf2 = document.getElementById('nf2Section');
    
    if (quantidadeNF === '2 Notas Fiscais') {
        nf2.style.display = 'block';
        document.getElementById('banco2').required = true;
        document.getElementById('titular2').required = true;
        document.getElementById('chavePix2').required = true;
        document.getElementById('arquivo2').required = true;
    } else {
        nf2.style.display = 'none';
        document.getElementById('banco2').required = false;
        document.getElementById('titular2').required = false;
        document.getElementById('chavePix2').required = false;
        document.getElementById('arquivo2').required = false;
    }
}

function setupRadios() {
    document.querySelectorAll('.radio input').forEach(input => {
        input.addEventListener('change', function() {
            updateRadioActive(this);
        });
    });
}

function updateRadioActive(input) {
    const radio = input.closest('.radio');
    const group = radio.closest('.radio-buttons');
    
    group.querySelectorAll('.radio').forEach(r => r.classList.remove('active'));
    radio.classList.add('active');
}

function setupUploads() {
    setupUpload(1);
    setupUpload(2);
}

function setupUpload(n) {
    const upload = document.getElementById(`upload${n}`);
    const input = document.getElementById(`arquivo${n}`);
    const empty = upload.querySelector('.upload-empty');
    const filled = upload.querySelector('.upload-filled');
    const fileName = filled.querySelector('.file-name');
    
    upload.addEventListener('click', (e) => {
        if (!e.target.closest('.btn-remove')) {
            input.click();
        }
    });
    
    input.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            
            if (file.type !== 'application/pdf') {
                alert('Apenas arquivos PDF');
                this.value = '';
                return;
            }
            
            if (file.size > 10 * 1024 * 1024) {
                alert('Arquivo excede 10 MB');
                this.value = '';
                return;
            }
            
            fileName.textContent = file.name;
            empty.style.display = 'none';
            filled.style.display = 'flex';
            upload.style.borderStyle = 'solid';
            upload.style.borderColor = 'var(--primary)';
        }
    });
    
    upload.addEventListener('dragover', (e) => {
        e.preventDefault();
        upload.style.borderColor = 'var(--primary)';
    });
    
    upload.addEventListener('dragleave', (e) => {
        e.preventDefault();
        upload.style.borderColor = 'var(--border)';
    });
    
    upload.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            input.files = e.dataTransfer.files;
            input.dispatchEvent(new Event('change'));
        }
    });
}

function removeFile(n) {
    const input = document.getElementById(`arquivo${n}`);
    const upload = document.getElementById(`upload${n}`);
    const empty = upload.querySelector('.upload-empty');
    const filled = upload.querySelector('.upload-filled');
    
    input.value = '';
    empty.style.display = 'block';
    filled.style.display = 'none';
    upload.style.borderStyle = 'dashed';
    upload.style.borderColor = 'var(--border)';
}

async function submitForm() {
    if (!validateStep2()) return;
    
    const btn = document.getElementById('submitBtn');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');
    
    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline';
    
    try {
        const data = collectData();
        await sendToGoogle(data);
        showSuccess();
    } catch (error) {
        console.error(error);
        alert('Erro ao enviar. Tente novamente.');
        btn.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

function collectData() {
    const quantidadeNF = document.querySelector('input[name="quantidadeNF"]:checked').value;
    
    const data = {
        codigoCampanha: document.getElementById('codigoCampanha').value.trim(),
        creator: document.getElementById('creator').value.trim(),
        quantidadeNF: quantidadeNF,
        nf1: {
            banco: document.getElementById('banco1').value.trim(),
            titular: document.getElementById('titular1').value.trim(),
            chavePix: document.getElementById('chavePix1').value.trim(),
            arquivo: document.getElementById('arquivo1').files[0]
        }
    };
    
    if (quantidadeNF === '2 Notas Fiscais') {
        data.nf2 = {
            banco: document.getElementById('banco2').value.trim(),
            titular: document.getElementById('titular2').value.trim(),
            chavePix: document.getElementById('chavePix2').value.trim(),
            arquivo: document.getElementById('arquivo2').files[0]
        };
    }
    
    return data;
}

async function sendToGoogle(data) {
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwMIagIfc1mhnlH4fVXQ70EqIr9jgc3EynFGcrXFi5r-Ih78HAwSbgWRNSoySVcbveGHg/exec';
    
    const nf1Base64 = await fileToBase64(data.nf1.arquivo);
    
    const payload = {
        codigoCampanha: data.codigoCampanha,
        creator: data.creator,
        quantidadeNF: data.quantidadeNF,
        nf1: {
            banco: data.nf1.banco,
            titular: data.nf1.titular,
            chavePix: data.nf1.chavePix,
            fileName: data.nf1.arquivo.name,
            fileData: nf1Base64,
            mimeType: data.nf1.arquivo.type
        }
    };
    
    if (data.nf2) {
        const nf2Base64 = await fileToBase64(data.nf2.arquivo);
        payload.nf2 = {
            banco: data.nf2.banco,
            titular: data.nf2.titular,
            chavePix: data.nf2.chavePix,
            fileName: data.nf2.arquivo.name,
            fileData: nf2Base64,
            mimeType: data.nf2.arquivo.type
        };
    }
    
    await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    return true;
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

function showSuccess() {
    document.querySelector('.step-2').style.display = 'none';
    document.getElementById('successMessage').style.display = 'block';
    document.querySelector('.step-indicator').style.display = 'none';
}