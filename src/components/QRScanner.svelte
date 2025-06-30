<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import jsQR from 'jsqr';

  const dispatch = createEventDispatcher();

  export let isOpen = false;
  export let scanMode: 'camera' | 'upload' = 'camera';

  let videoElement: HTMLVideoElement;
  let canvasElement: HTMLCanvasElement;
  let canvasContext: CanvasRenderingContext2D;
  let stream: MediaStream | null = null;
  let scanning = false;
  let scanResult = '';
  let errorMessage = '';
  let fileInput: HTMLInputElement;

  onMount(() => {
    if (canvasElement) {
      canvasContext = canvasElement.getContext('2d')!;
    }
  });

  onDestroy(() => {
    stopCamera();
  });

  async function startCamera() {
    try {
      errorMessage = '';
      stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.play();
        scanning = true;
        requestAnimationFrame(scanFrame);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      errorMessage = 'Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.';
    }
  }

  function stopCamera() {
    scanning = false;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
  }

  function scanFrame() {
    if (!scanning || !videoElement || !canvasElement || !canvasContext) return;

    if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
      
      const imageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        scanResult = code.data;
        handleScanSuccess(code.data);
        return;
      }
    }
    
    if (scanning) {
      requestAnimationFrame(scanFrame);
    }
  }

  function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create a temporary canvas to process the image
          const tempCanvas = document.createElement('canvas');
          const tempContext = tempCanvas.getContext('2d')!;
          
          tempCanvas.width = img.width;
          tempCanvas.height = img.height;
          tempContext.drawImage(img, 0, 0);
          
          const imageData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            handleScanSuccess(code.data);
          } else {
            errorMessage = 'Tidak dapat membaca QR code dari gambar ini. Pastikan gambar jelas dan mengandung QR code.';
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  function handleScanSuccess(data: string) {
    scanResult = data;
    stopCamera();
    dispatch('scanned', { text: data });
    closeScanner();
  }

  function closeScanner() {
    stopCamera();
    isOpen = false;
    scanResult = '';
    errorMessage = '';
    dispatch('close');
  }

  function switchMode(mode: 'camera' | 'upload') {
    scanMode = mode;
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  }

  // Auto start camera when modal opens and camera mode is selected
  $: if (isOpen && scanMode === 'camera') {
    startCamera();
  }

  // Stop camera when modal closes
  $: if (!isOpen) {
    stopCamera();
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-60">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" class="text-white">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">Scan QR Code</h3>
            <p class="text-sm text-gray-600">Scan untuk mendapatkan text</p>
          </div>
        </div>
        <button 
          on:click={closeScanner}
          class="p-2 hover:bg-white/50 rounded-lg transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="text-gray-500">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>

      <!-- Mode Selector -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex space-x-2">
          <button 
            class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors {scanMode === 'camera' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
            on:click={() => switchMode('camera')}
          >
            📷 Kamera
          </button>
          <button 
            class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors {scanMode === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
            on:click={() => switchMode('upload')}
          >
            🖼️ Upload Gambar
          </button>
        </div>
      </div>

      <!-- Scanner Content -->
      <div class="p-4">
        {#if scanMode === 'camera'}
          <div class="space-y-4">
            <div class="relative bg-black rounded-lg overflow-hidden" style="aspect-ratio: 4/3;">
              <video 
                bind:this={videoElement}
                class="w-full h-full object-cover"
                autoplay
                muted
                playsinline
              ></video>
              
              <!-- Scanning overlay -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-48 h-48 border-2 border-white rounded-lg relative">
                  <div class="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                  <div class="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                  <div class="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                  <div class="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                </div>
              </div>
              
              {#if scanning}
                <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div class="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    Arahkan kamera ke QR code...
                  </div>
                </div>
              {/if}
            </div>
            
            {#if !scanning && !stream}
              <button 
                on:click={startCamera}
                class="w-full btn-primary"
              >
                📷 Mulai Scan dengan Kamera
              </button>
            {/if}
          </div>
        {:else}
          <div class="space-y-4">
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <p class="text-gray-600 mb-4">Pilih gambar QR code dari galeri</p>
              <input 
                bind:this={fileInput}
                type="file" 
                accept="image/*"
                on:change={handleFileUpload}
                class="hidden"
              />
              <button 
                on:click={() => fileInput?.click()}
                class="btn-primary"
              >
                🖼️ Pilih Gambar
              </button>
            </div>
          </div>
        {/if}

        <!-- Error Message -->
        {#if errorMessage}
          <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <p class="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        {/if}

        <!-- Success Message -->
        {#if scanResult}
          <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center space-x-2 mb-2">
              <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <p class="text-sm font-medium text-green-700">QR Code berhasil dibaca!</p>
            </div>
            <p class="text-sm text-green-600 bg-green-100 p-2 rounded font-mono break-all">
              {scanResult}
            </p>
          </div>
        {/if}
      </div>

      <!-- Instructions -->
      <div class="px-4 pb-4">
        <div class="bg-blue-50 p-3 rounded-lg">
          <h4 class="text-sm font-medium text-blue-800 mb-1">💡 Tips:</h4>
          <ul class="text-xs text-blue-700 space-y-1">
            <li>• Pastikan QR code terlihat jelas dan tidak buram</li>
            <li>• Untuk kamera: arahkan ke QR code dengan jarak yang tepat</li>
            <li>• Untuk upload: pilih gambar dengan kualitas yang baik</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Hidden canvas for processing -->
    <canvas bind:this={canvasElement} class="hidden"></canvas>
  </div>
{/if}