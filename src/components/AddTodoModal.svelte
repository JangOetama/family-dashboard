<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { todos } from '../stores/data';
  import QRScanner from './QRScanner.svelte';

  const dispatch = createEventDispatcher();

  let title = '';
  let category = 'keluarga';
  let priority = 'medium';
  let budget = 0;
  let goalNote = '';
  let notes = '';
  let repeatType = 'none';
  let startDate = new Date().toISOString().split('T')[0];
  let tasks = [{ title: '', time: '', quantity: 0, unit: '', financeLinked: false, financePrice: 0, code: '', attachments: [], showAttachments: false }];
  let tags = [''];

  // QR Scanner state
  let showQRScanner = false;
  let currentScanTarget: { taskIndex: number, attachmentIndex: number } | null = null;

  const categories = [
    { value: 'keluarga', label: 'Keluarga', icon: '👨‍👩‍👧‍👦' },
    { value: 'kesehatan', label: 'Kesehatan', icon: '🏥' },
    { value: 'rumah_tangga', label: 'Rumah Tangga', icon: '🏠' },
    { value: 'ibadah', label: 'Ibadah', icon: '🕌' },
    { value: 'pekerjaan', label: 'Pekerjaan', icon: '💼' },
    { value: 'pendidikan', label: 'Pendidikan', icon: '📚' }
  ];

  const priorities = [
    { value: 'low', label: 'Rendah', color: 'bg-green-500' },
    { value: 'medium', label: 'Sedang', color: 'bg-amber-500' },
    { value: 'high', label: 'Tinggi', color: 'bg-red-500' }
  ];

  const repeatOptions = [
    { value: 'none', label: 'Sekali saja', icon: '📅' },
    { value: 'daily', label: 'Setiap hari', icon: '🔄' },
    { value: 'weekly', label: 'Setiap minggu', icon: '📆' },
    { value: 'monthly', label: 'Setiap bulan', icon: '🗓️' },
    { value: 'yearly', label: 'Setiap tahun', icon: '📊' }
  ];

  const attachmentTypes = [
    { value: 'qr_code', label: 'QR Code', icon: '📱' },
    { value: 'maps', label: 'Google Maps', icon: '🗺️' },
    { value: 'link', label: 'Link/URL', icon: '🔗' },
    { value: 'photo', label: 'Foto', icon: '📷' }
  ];

  function addTask() {
    tasks = [...tasks, { title: '', time: '', quantity: 0, unit: '', financeLinked: false, financePrice: 0, code: '', attachments: [], showAttachments: false }];
  }

  function removeTask(index: number) {
    tasks = tasks.filter((_, i) => i !== index);
  }

  function addTag() {
    tags = [...tags, ''];
  }

  function removeTag(index: number) {
    tags = tags.filter((_, i) => i !== index);
  }

  function toggleAttachments(taskIndex: number) {
    tasks[taskIndex].showAttachments = !tasks[taskIndex].showAttachments;
    tasks = [...tasks];
  }

  function addAttachment(taskIndex: number) {
    tasks[taskIndex].attachments = [...tasks[taskIndex].attachments, { 
      type: 'link', 
      url: '', 
      qrText: '', 
      showPreview: false,
      originalImage: '',
      extractedText: ''
    }];
    tasks = [...tasks];
  }

  function removeAttachment(taskIndex: number, attachmentIndex: number) {
    tasks[taskIndex].attachments = tasks[taskIndex].attachments.filter((_, i) => i !== attachmentIndex);
    tasks = [...tasks];
  }

  function handleFileUpload(event: Event, taskIndex: number, attachmentIndex: number) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        tasks[taskIndex].attachments[attachmentIndex].originalImage = result;
        tasks[taskIndex].attachments[attachmentIndex].url = result;
        tasks[taskIndex].attachments[attachmentIndex].showPreview = true;
        tasks = [...tasks];
      };
      reader.readAsDataURL(file);
    }
  }

  function generateQRFromText(taskIndex: number, attachmentIndex: number) {
    const qrText = tasks[taskIndex].attachments[attachmentIndex].qrText;
    if (qrText && qrText.trim()) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&format=png&ecc=M&margin=10&data=${encodeURIComponent(qrText.trim())}`;
      tasks[taskIndex].attachments[attachmentIndex].url = qrUrl;
      tasks[taskIndex].attachments[attachmentIndex].showPreview = true;
      tasks = [...tasks];
    }
  }

  function regenerateQRFromImage(taskIndex: number, attachmentIndex: number) {
    const extractedText = tasks[taskIndex].attachments[attachmentIndex].extractedText;
    if (extractedText && extractedText.trim()) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&format=png&ecc=M&margin=10&data=${encodeURIComponent(extractedText.trim())}`;
      tasks[taskIndex].attachments[attachmentIndex].url = qrUrl;
      tasks[taskIndex].attachments[attachmentIndex].showPreview = true;
      tasks = [...tasks];
    }
  }

  function restoreOriginalImage(taskIndex: number, attachmentIndex: number) {
    const originalImage = tasks[taskIndex].attachments[attachmentIndex].originalImage;
    if (originalImage) {
      tasks[taskIndex].attachments[attachmentIndex].url = originalImage;
      tasks = [...tasks];
    }
  }

  function openQRScanner(taskIndex: number, attachmentIndex: number) {
    currentScanTarget = { taskIndex, attachmentIndex };
    showQRScanner = true;
  }

  function handleQRScanned(event: CustomEvent) {
    if (currentScanTarget) {
      const { taskIndex, attachmentIndex } = currentScanTarget;
      const scannedText = event.detail.text;
      
      // Set the scanned text to the QR text input
      tasks[taskIndex].attachments[attachmentIndex].qrText = scannedText;
      tasks[taskIndex].attachments[attachmentIndex].extractedText = scannedText;
      tasks = [...tasks];
      
      // Auto-generate QR code from scanned text
      generateQRFromText(taskIndex, attachmentIndex);
    }
    
    showQRScanner = false;
    currentScanTarget = null;
  }

  function closeQRScanner() {
    showQRScanner = false;
    currentScanTarget = null;
  }

  function generateMapsEmbed(location: string): string {
    if (!location.trim()) return '';
    
    const coordPattern = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
    if (coordPattern.test(location.trim())) {
      const [lat, lng] = location.split(',');
      return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15000!2d${lng.trim()}!3d${lat.trim()}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sid!4v1642000000000!5m2!1sen!2sid`;
    } else {
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.0!2d106.8!3d-6.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s${encodeURIComponent(location)}!5e0!3m2!1sen!2sid!4v1642000000000!5m2!1sen!2sid`;
    }
  }

  function openMapsApp(location: string) {
    const gojekUrl = `gojek://maps?q=${encodeURIComponent(location)}`;
    const grabUrl = `grab://maps?q=${encodeURIComponent(location)}`;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    
    window.open(gojekUrl, '_blank');
    setTimeout(() => {
      window.open(grabUrl, '_blank');
    }, 100);
    setTimeout(() => {
      window.open(googleMapsUrl, '_blank');
    }, 200);
  }

  function openUrl(url: string) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank');
    }
  }

  function togglePreview(taskIndex: number, attachmentIndex: number) {
    tasks[taskIndex].attachments[attachmentIndex].showPreview = !tasks[taskIndex].attachments[attachmentIndex].showPreview;
    tasks = [...tasks];
  }

  function saveTodo() {
    const newTodo = {
      id: Date.now().toString(),
      title,
      category,
      priority,
      budget: budget || undefined,
      schedule: {
        repeat: {
          type: repeatType,
          start_date: startDate,
        },
        alert: {
          type: 'before',
          value: '1h'
        }
      },
      goal_note: goalNote,
      tasks: tasks.filter(task => task.title.trim()).map(task => ({
        title: task.title,
        done: false,
        time: task.time || undefined,
        quantity: task.quantity || undefined,
        unit: task.unit || undefined,
        code: task.code || undefined,
        finance: task.financeLinked ? {
          linked: true,
          type: 'out',
          price: task.financePrice
        } : undefined,
        attachments: task.attachments.filter(att => att.url.trim()).map(att => ({
          type: att.type,
          url: att.url
        }))
      })),
      notes,
      tags: tags.filter(tag => tag.trim()),
      notify_to: [],
      visibility: 'shared',
      created_at: new Date(),
      updated_at: new Date()
    };

    todos.update(todoList => [...todoList, newTodo]);
    dispatch('close');
  }

  function closeModal() {
    dispatch('close');
  }

  $: selectedCategoryIcon = categories.find(cat => cat.value === category)?.icon || '📋';
  $: selectedRepeatIcon = repeatOptions.find(opt => opt.value === repeatType)?.icon || '📅';
</script>

<div class="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4 z-50">
  <div class="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:max-w-4xl h-[95vh] md:h-[90vh] flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b border-gray-100 bg-blue-50 flex-shrink-0">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="text-white">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900">Tambah Task Baru</h2>
          <p class="text-sm text-gray-600">Buat aktivitas dan atur jadwal Anda</p>
        </div>
      </div>
      <button 
        on:click={closeModal}
        class="p-2 hover:bg-white/50 rounded-lg transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="text-gray-500">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto">
      <div class="p-6 space-y-6">
        <!-- Basic Information -->
        <div class="space-y-4">
          <div class="section-header">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" class="section-icon">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
            </svg>
            <h3 class="section-title">Informasi Dasar</h3>
          </div>

          <div class="form-group">
            <label for="title" class="form-label">Judul Task</label>
            <input 
              id="title"
              type="text" 
              bind:value={title}
              class="form-input"
              placeholder="Masukkan judul kegiatan..."
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group">
              <label for="category" class="form-label">Kategori</label>
              <div class="relative">
                <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg pointer-events-none">
                  {selectedCategoryIcon}
                </div>
                <select 
                  id="category"
                  bind:value={category}
                  class="form-select pl-12 appearance-none bg-white"
                >
                  {#each categories as cat}
                    <option value={cat.value}>{cat.icon} {cat.label}</option>
                  {/each}
                </select>
                <div class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" class="text-gray-400">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Prioritas</label>
              <div class="space-y-2">
                {#each priorities as prio}
                  <button
                    type="button"
                    class="priority-button {priority === prio.value ? 'selected' : 'unselected'}"
                    on:click={() => priority = prio.value}
                  >
                    <span class="text-sm font-medium">{prio.label}</span>
                    <div class="priority-dot {prio.color}"></div>
                  </button>
                {/each}
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="goalNote" class="form-label">Catatan Tujuan</label>
            <input 
              id="goalNote"
              type="text" 
              bind:value={goalNote}
              class="form-input"
              placeholder="Contoh: 2 Liter/hari, 2x setelah makan..."
            />
          </div>
        </div>

        <!-- Schedule -->
        <div class="space-y-4">
          <div class="section-header">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" class="section-icon">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
            </svg>
            <h3 class="section-title">Jadwal & Pengulangan</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-group">
              <label for="repeatType" class="form-label">Jenis Pengulangan</label>
              <div class="relative">
                <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg pointer-events-none">
                  {selectedRepeatIcon}
                </div>
                <select 
                  id="repeatType"
                  bind:value={repeatType}
                  class="form-select pl-12 appearance-none bg-white"
                >
                  {#each repeatOptions as option}
                    <option value={option.value}>{option.icon} {option.label}</option>
                  {/each}
                </select>
                <div class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" class="text-gray-400">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div class="form-group">
                <label for="startDate" class="form-label">Tanggal Mulai</label>
                <input 
                  id="startDate"
                  type="date" 
                  bind:value={startDate}
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="budget" class="form-label">Budget (Opsional)</label>
                <div class="relative">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
                  </svg>
                  <input 
                    id="budget"
                    type="number" 
                    bind:value={budget}
                    class="form-input pl-10"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tasks -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="section-header">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" class="section-icon">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
              </svg>
              <h3 class="section-title">Daftar Tugas</h3>
            </div>
            <button 
              on:click={addTask}
              class="btn-secondary text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" class="mr-1">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
              </svg>
              Tambah
            </button>
          </div>

          <div class="space-y-4">
            {#each tasks as task, index}
              <div class="bg-gray-50 rounded-lg p-4 space-y-4">
                <div class="flex items-start space-x-3">
                  <div class="flex-1">
                    <input 
                      type="text" 
                      bind:value={task.title}
                      class="form-input"
                      placeholder="Nama tugas..."
                    />
                  </div>
                  {#if tasks.length > 1}
                    <button 
                      on:click={() => removeTask(index)}
                      class="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                      </svg>
                    </button>
                  {/if}
                </div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div class="form-group">
                    <label class="text-xs font-medium text-gray-600">Waktu</label>
                    <input 
                      type="time" 
                      bind:value={task.time}
                      class="form-input text-sm"
                    />
                  </div>
                  <div class="form-group">
                    <label class="text-xs font-medium text-gray-600">Jumlah</label>
                    <input 
                      type="number" 
                      bind:value={task.quantity}
                      class="form-input text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div class="form-group">
                    <label class="text-xs font-medium text-gray-600">Satuan</label>
                    <input 
                      type="text" 
                      bind:value={task.unit}
                      class="form-input text-sm"
                      placeholder="kg, liter, dll"
                    />
                  </div>
                  <div class="form-group">
                    <label class="text-xs font-medium text-gray-600">Kode/ID</label>
                    <input 
                      type="text" 
                      bind:value={task.code}
                      class="form-input text-sm"
                      placeholder="Kode unik..."
                    />
                  </div>
                </div>

                <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <label class="flex items-center space-x-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      bind:checked={task.financeLinked}
                      class="form-checkbox"
                    />
                    <span class="text-sm font-medium text-gray-700">Link ke keuangan</span>
                  </label>
                  
                  {#if task.financeLinked}
                    <div class="flex items-center space-x-2">
                      <span class="text-xs text-gray-500">Rp</span>
                      <input 
                        type="number" 
                        bind:value={task.financePrice}
                        class="w-24 px-2 py-1 rounded border border-gray-200 text-sm"
                        placeholder="0"
                      />
                    </div>
                  {/if}
                </div>

                <!-- Attachment Buttons -->
                <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <span class="text-sm font-medium text-gray-700">Lampiran</span>
                  <div class="flex items-center space-x-2">
                    {#each attachmentTypes as type}
                      <button 
                        on:click={() => {
                          if (!task.showAttachments) {
                            task.showAttachments = true;
                          }
                          addAttachment(index);
                          const newAttachment = task.attachments[task.attachments.length - 1];
                          newAttachment.type = type.value;
                          tasks = [...tasks];
                        }}
                        class="p-2 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                        title={type.label}
                      >
                        {type.icon}
                      </button>
                    {/each}
                    {#if task.attachments.length > 0}
                      <button 
                        on:click={() => toggleAttachments(index)}
                        class="p-2 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                        title="Toggle attachments"
                      >
                        {task.showAttachments ? '👁️' : '👁️‍🗨️'}
                      </button>
                    {/if}
                  </div>
                </div>

                <!-- Attachments Section -->
                {#if task.showAttachments && task.attachments.length > 0}
                  <div class="space-y-3 border-t border-gray-200 pt-4">
                    {#each task.attachments as attachment, attachmentIndex}
                      <div class="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
                        <div class="flex items-center justify-between">
                          <select 
                            bind:value={attachment.type}
                            class="form-select text-sm flex-1 mr-3"
                          >
                            {#each attachmentTypes as type}
                              <option value={type.value}>{type.icon} {type.label}</option>
                            {/each}
                          </select>
                          <button 
                            on:click={() => removeAttachment(index, attachmentIndex)}
                            class="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                          >
                            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                            </svg>
                          </button>
                        </div>

                        {#if attachment.type === 'qr_code'}
                          <div class="space-y-3">
                            <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <h4 class="text-sm font-semibold text-blue-800 mb-2">📱 Generate QR Code</h4>
                              <div class="space-y-2">
                                <div class="flex space-x-2">
                                  <input 
                                    type="text"
                                    bind:value={attachment.qrText}
                                    class="form-input text-sm flex-1"
                                    placeholder="Masukkan text untuk QR code..."
                                  />
                                  <button 
                                    on:click={() => openQRScanner(index, attachmentIndex)}
                                    class="btn-secondary text-xs px-3 py-2 whitespace-nowrap"
                                    title="Scan QR Code"
                                  >
                                    📷 Scan
                                  </button>
                                </div>
                                <button 
                                  on:click={() => generateQRFromText(index, attachmentIndex)}
                                  class="btn-primary text-xs w-full"
                                  disabled={!attachment.qrText || !attachment.qrText.trim()}
                                >
                                  🔄 Generate QR Kualitas Tinggi
                                </button>
                              </div>
                            </div>
                            
                            {#if attachment.url && attachment.showPreview}
                              <div class="flex justify-center">
                                <div class="relative">
                                  <img 
                                    src={attachment.url} 
                                    alt="QR Code" 
                                    class="w-48 h-48 border rounded cursor-pointer hover:scale-105 transition-transform" 
                                    on:click={() => togglePreview(index, attachmentIndex)}
                                  />
                                  <button 
                                    on:click={() => togglePreview(index, attachmentIndex)}
                                    class="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded text-xs"
                                  >
                                    🔍
                                  </button>
                                </div>
                              </div>
                            {/if}
                          </div>
                        {:else if attachment.type === 'maps'}
                          <div class="space-y-2">
                            <input 
                              type="text"
                              bind:value={attachment.url}
                              class="form-input text-sm"
                              placeholder="Masukkan alamat atau koordinat (lat,lng)..."
                            />
                            <p class="text-xs text-gray-500">
                              Contoh: "Jakarta" atau "-6.2088,106.8456" (latitude,longitude)
                            </p>
                            {#if attachment.url}
                              <div class="space-y-2">
                                <div class="maps-preview cursor-pointer" on:click={() => openMapsApp(attachment.url)}>
                                  <iframe
                                    src={generateMapsEmbed(attachment.url)}
                                    class="w-full h-full"
                                    style="border:0;"
                                    allowfullscreen=""
                                    loading="lazy"
                                    referrerpolicy="no-referrer-when-downgrade"
                                    title="Google Maps"
                                  ></iframe>
                                  <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center">
                                    <span class="text-white bg-black bg-opacity-50 px-2 py-1 rounded text-xs opacity-0 hover:opacity-100 transition-opacity">
                                      Klik untuk buka di Maps
                                    </span>
                                  </div>
                                </div>
                                <div class="flex space-x-2">
                                  <button 
                                    on:click={() => openMapsApp(attachment.url)}
                                    class="btn-secondary text-xs flex-1"
                                  >
                                    🗺️ Buka di Maps
                                  </button>
                                </div>
                              </div>
                            {/if}
                          </div>
                        {:else if attachment.type === 'photo'}
                          <div class="space-y-2">
                            <input 
                              type="file" 
                              accept="image/*"
                              on:change={(e) => handleFileUpload(e, index, attachmentIndex)}
                              class="form-input text-sm"
                            />
                            {#if attachment.url && attachment.showPreview}
                              <div class="flex justify-center">
                                <img 
                                  src={attachment.url} 
                                  alt="Uploaded" 
                                  class="max-w-48 max-h-48 border rounded cursor-pointer hover:scale-105 transition-transform" 
                                  on:click={() => togglePreview(index, attachmentIndex)}
                                />
                              </div>
                            {/if}
                          </div>
                        {:else}
                          <div class="space-y-2">
                            <input 
                              type="url"
                              bind:value={attachment.url}
                              class="form-input text-sm"
                              placeholder="Masukkan URL..."
                            />
                            {#if attachment.url}
                              <button 
                                on:click={() => openUrl(attachment.url)}
                                class="text-xs text-blue-600 hover:text-blue-700 underline w-full text-left"
                              >
                                🔗 Buka Link: {attachment.url}
                              </button>
                            {/if}
                          </div>
                        {/if}
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>

        <!-- Tags -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="section-header">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" class="section-icon">
                <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
              </svg>
              <h3 class="section-title">Tags</h3>
            </div>
            <button 
              on:click={addTag}
              class="btn-secondary text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" class="mr-1">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
              </svg>
              Tambah
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            {#each tags as tag, index}
              <div class="flex items-center space-x-2">
                <div class="flex-1 relative">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
                  </svg>
                  <input 
                    type="text" 
                    bind:value={tag}
                    class="form-input pl-10"
                    placeholder="Nama tag..."
                  />
                </div>
                {#if tags.length > 1}
                  <button 
                    on:click={() => removeTag(index)}
                    class="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        </div>

        <!-- Notes -->
        <div class="space-y-4">
          <div class="section-header">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" class="section-icon">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
            </svg>
            <h3 class="section-title">Catatan Tambahan</h3>
          </div>
          <textarea 
            bind:value={notes}
            rows="3"
            class="form-textarea"
            placeholder="Tambahkan catatan atau instruksi khusus..."
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
      <button 
        on:click={closeModal}
        class="btn-secondary"
      >
        Batal
      </button>
      <button 
        on:click={saveTodo}
        class="btn-primary"
        disabled={!title.trim()}
      >
        Simpan Task
      </button>
    </div>
  </div>
</div>

<!-- QR Scanner Modal -->
<QRScanner 
  bind:isOpen={showQRScanner}
  on:scanned={handleQRScanned}
  on:close={closeQRScanner}
/>