// Global variables
let originalImage = null;
let processedImage = null;
let currentFormat = 'png';
const API_KEY = 'zz6ZVZbzYBmaB2uyBinYd4r4'; // API key for Remove.bg
const API_URL = 'https://api.remove.bg/v1.0/removebg';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('formatPng').addEventListener('click', () => setActiveFormat('png'));
    document.getElementById('formatJpg').addEventListener('click', () => setActiveFormat('jpg'));
    document.getElementById('compareBtn').addEventListener('click', toggleCompareView);
    document.getElementById('downloadBtn').addEventListener('click', downloadImage);
});

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.match('image.*')) {
        loadImage(file);
    }
}

function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.match('image.*')) {
        loadImage(file);
    }
}

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        originalImage = e.target.result;
        const originalPreview = document.getElementById('originalPreview');
        originalPreview.src = originalImage;
        originalPreview.classList.remove('hidden');
        document.getElementById('emptyState').classList.add('hidden');
        document.getElementById('processedPreview').classList.add('hidden');
        document.getElementById('compareContainer').classList.add('hidden');
        document.getElementById('processBtn').disabled = false;
        document.getElementById('compareBtn').disabled = true;
        document.getElementById('downloadBtn').disabled = true;
    };
    reader.readAsDataURL(file);
}

async function processImage() {
    document.getElementById('loadingIndicator').classList.remove('hidden');
    document.getElementById('processBtn').disabled = true;

    try {
        const response = await fetch(originalImage);
        const blob = await response.blob();
        const formData = new FormData();
        formData.append('image_file', blob);
        formData.append('size', document.getElementById('sizeSelect').value);

        const apiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'X-Api-Key': API_KEY },
            body: formData
        });

        if (!apiResponse.ok) throw new Error('Falha ao remover o fundo');

        const resultBlob = await apiResponse.blob();
        processedImage = URL.createObjectURL(resultBlob);

        const processedPreview = document.getElementById('processedPreview');
        processedPreview.src = processedImage;
        processedPreview.classList.remove('hidden');

        document.getElementById('compareOriginal').src = originalImage;
        document.getElementById('compareProcessed').src = processedImage;

        document.getElementById('loadingIndicator').classList.add('hidden');
        document.getElementById('compareBtn').disabled = false;
        document.getElementById('downloadBtn').disabled = false;

        showToast('Fundo removido com sucesso!', 'success');
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loadingIndicator').classList.add('hidden');
        document.getElementById('processBtn').disabled = false;
        showToast('Erro ao remover o fundo: ' + error.message, 'error');
    }
}

function setActiveFormat(format) {
    currentFormat = format;
    const formatPng = document.getElementById('formatPng');
    const formatJpg = document.getElementById('formatJpg');

    [formatPng, formatJpg].forEach(btn => btn.classList.remove('bg-indigo-600', 'text-white'));
    [formatPng, formatJpg].forEach(btn => btn.classList.add('bg-gray-200', 'text-gray-700'));

    const activeBtn = format === 'png' ? formatPng : formatJpg;
    activeBtn.classList.add('bg-indigo-600', 'text-white');
    activeBtn.classList.remove('bg-gray-200', 'text-gray-700');
}

function toggleCompareView() {
    const compareContainer = document.getElementById('compareContainer');
    const processedPreview = document.getElementById('processedPreview');
    const compareBtn = document.getElementById('compareBtn');
    const tooltipText = document.querySelector('.tooltip-text');

    if (compareContainer.classList.contains('hidden')) {
        compareContainer.classList.remove('hidden');
        processedPreview.classList.add('hidden');
        compareBtn.innerHTML = '<i class="fas fa-eye"></i>';
        tooltipText.textContent = 'Visualizar resultado';
    } else {
        compareContainer.classList.add('hidden');
        processedPreview.classList.remove('hidden');
        compareBtn.innerHTML = '<i class="fas fa-exchange-alt"></i>';
        tooltipText.textContent = 'Comparar antes/depois';
    }
}

function updateSlider() {
    const slider = document.getElementById('slider');
    const value = slider.value;

    document.getElementById('compareOriginal').style.clipPath = `inset(0 ${100 - value}% 0 0)`;
    document.getElementById('compareProcessed').style.clipPath = `inset(0 0 0 ${value}%)`;
    document.querySelector('.divider').style.left = `${value}%`;
    document.querySelector('.slider-button').style.left = `calc(${value}% - 15px)`;
}

function downloadImage() {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `imagem-sem-fundo.${currentFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Download iniciado!', 'success');
}

function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => { document.body.removeChild(toast); }, 300);
    }, 3000);
}
