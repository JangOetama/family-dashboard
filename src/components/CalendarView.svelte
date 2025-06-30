<script lang="ts">
  import { todos } from '../stores/data';
  import AddTodoModal from './AddTodoModal.svelte';
  import EditTodoModal from './EditTodoModal.svelte';

  let currentWeek = new Date();
  // MODIFIKASI 2: Inisialisasi selectedDate ke tanggal hari ini
  let selectedDate: Date | null = new Date(); 
  let showAddModal = false;
  let showEditModal = false;
  let editingTodo: any = null;

  $: weekDays = getWeekDays(currentWeek);
  $: todosForWeek = getTodosForWeek(weekDays, $todos);
  $: selectedDateTodos = selectedDate ? (todosForWeek.get(selectedDate.toISOString().split('T')[0]) || []) : [];

  function getWeekDays(date: Date): Date[] {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }

  function getTodosForWeek(weekDays: Date[], todoList: any[]) {
    const todosMap = new Map();
    
    weekDays.forEach(day => {
      const dayKey = day.toISOString().split('T')[0];
      todosMap.set(dayKey, []);
    });

    todoList.forEach(todo => {
      weekDays.forEach(day => {
        if (shouldShowTodoOnDay(todo, day)) {
          const dayKey = day.toISOString().split('T')[0];
          const existing = todosMap.get(dayKey) || [];
          todosMap.set(dayKey, [...existing, todo]);
        }
      });
    });

    return todosMap;
  }

  function shouldShowTodoOnDay(todo: any, day: Date): boolean {
    const startDate = new Date(todo.schedule.repeat.start_date);
    const endDate = todo.schedule.repeat.end_date ? new Date(todo.schedule.repeat.end_date) : null;
    
    if (day < startDate || (endDate && day > endDate)) {
      return false;
    }

    const { type, days_of_week, dates_of_month } = todo.schedule.repeat;
    
    switch (type) {
      case 'daily':
        return true;
      case 'weekly':
        return days_of_week?.includes(day.getDay()) || false;
      case 'monthly':
        return dates_of_month?.includes(day.getDate()) || false;
      case 'yearly':
        return day.getMonth() === startDate.getMonth() && day.getDate() === startDate.getDate();
      case 'none':
        return day.toDateString() === startDate.toDateString();
      default:
        return false;
    }
  }

  function navigateWeek(direction: number) {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    currentWeek = newWeek;
    // MODIFIKASI 2: Selalu pilih hari ini saat navigasi minggu
    selectedDate = new Date(); 
  }

  function selectDate(date: Date) {
    selectedDate = date;
  }

  function isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  function isSelected(date: Date): boolean {
    return selectedDate ? date.toDateString() === selectedDate.toDateString() : false;
  }

  function openAddModal() {
    showAddModal = true;
  }

  function closeAddModal() {
    showAddModal = false;
  }

  function openEditModal(todo: any) {
    editingTodo = todo;
    showEditModal = true;
  }

  function closeEditModal() {
    showEditModal = false;
    editingTodo = null;
  }

  function toggleTask(todoId: string, taskIndex: number) {
    todos.update(todoList => {
      return todoList.map(t => {
        if (t.id === todoId) {
          const updatedTasks = [...t.tasks];
          updatedTasks[taskIndex].done = !updatedTasks[taskIndex].done;
          return { ...t, tasks: updatedTasks, updated_at: new Date() };
        }
        return t;
      });
    });
  }

  function getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }

  function getCategoryIcon(category: string): string {
    switch (category) {
      case 'kesehatan': return '🏥';
      case 'keluarga': return '👨‍👩‍👧‍👦';
      case 'rumah_tangga': return '🏠';
      case 'ibadah': return '🕌';
      case 'pekerjaan': return '💼';
      case 'pendidikan': return '📚';
      default: return '📋';
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  function getCompletedTasksCount(todo: any): number {
    return todo.tasks.filter(task => task.done).length;
  }

  function getProgressPercentage(todo: any): number {
    const total = todo.tasks.length;
    const completed = getCompletedTasksCount(todo);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  function getTotalTaskPrice(todo: any): number {
    return todo.tasks.reduce((total, task) => {
      if (task.finance?.linked && task.finance?.price) {
        return total + task.finance.price;
      }
      return total;
    }, 0);
  }

  function hasTasksWithPrice(todo: any): boolean {
    return todo.tasks.some(task => task.finance?.linked && task.finance?.price > 0);
  }

  function renderAttachment(attachment: any) {
    switch (attachment.type) {
      case 'qr_code':
        return { icon: '📱', label: 'QR Code' };
      case 'maps':
        return { icon: '🗺️', label: 'Maps' };
      case 'photo':
        return { icon: '📷', label: 'Photo' };
      case 'link':
        return { icon: '🔗', label: 'Link' };
      default:
        return { icon: '📎', label: 'File' };
    }
  }

  // Fungsi handleEmbeddedClick digunakan untuk membuka link eksternal atau aplikasi peta
  function handleEmbeddedClick(attachment: any) {
    if (attachment.type === 'link' && attachment.url) {
      window.open(attachment.url, '_blank');
    } else if (attachment.type === 'maps' && attachment.url) {
      // Coba buka di berbagai aplikasi peta (Gojek, Grab, Google Maps)
      const gojekUrl = `gojek://maps?q=${encodeURIComponent(attachment.url)}`;
      const grabUrl = `grab://maps?q=${encodeURIComponent(attachment.url)}`;
      // Perbaiki format URL Google Maps
      const googleMapsUrl = `https://maps.google.com/?q=${encodeURIComponent(attachment.url)}`; 
      
      window.open(gojekUrl, '_blank');
      setTimeout(() => {
        window.open(grabUrl, '_blank');
      }, 100);
      setTimeout(() => {
        window.open(googleMapsUrl, '_blank');
      }, 200);
    }
  }

  function generateMapsEmbed(location: string): string {
    if (!location || !location.trim()) return '';
    
    const cleanLocation = location.trim();
    
    // Perbaiki format URL Google Maps embed
    const coordPattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/;
    if (coordPattern.test(cleanLocation)) {
      const [lat, lng] = cleanLocation.split(',').map(coord => coord.trim());
      return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    } else {
      return `https://maps.google.com/maps?q=${encodeURIComponent(cleanLocation)}&z=15&output=embed`;
    }
  }

  let selectedAttachment: any = null;
  let showAttachmentModal = false;

  function openAttachmentModal(attachment: any) {
    selectedAttachment = attachment;
    showAttachmentModal = true;
  }

  function closeAttachmentModal() {
    selectedAttachment = null;
    showAttachmentModal = false;
  }
</script>

<div class="space-y-6">
  <div class="card rounded-2xl p-4">
    <div class="flex items-center justify-between">
      <button 
        on:click={() => navigateWeek(-1)}
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="text-gray-600">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
      </button>
      
      <h2 class="text-lg font-semibold text-gray-900">
        {currentWeek.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
      </h2>
      
      <button 
        on:click={() => navigateWeek(1)}
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="text-gray-600">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>
  </div>

  <div class="card rounded-2xl p-4">
    <div class="text-center mb-6">
      <h3 class="text-sm font-medium text-gray-600 uppercase tracking-wide">Daftar Task</h3>
    </div>

    <div class="flex justify-between mb-6">
      {#each ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'] as dayName, index}
        {@const day = weekDays[index]}
        {@const dayTodos = todosForWeek.get(day.toISOString().split('T')[0]) || []}
        
        <button 
          class="calendar-day {isSelected(day) ? 'selected' : isToday(day) ? 'today' : 'default'}"
          on:click={() => selectDate(day)}
        >
          <div class="text-xs font-medium uppercase">{dayName}</div>
          <div class="text-lg font-bold">{day.getDate()}</div>
          {#if dayTodos.length > 0}
            <div class="calendar-indicators">
              {#each dayTodos.slice(0, 3) as todo}
                <div class="calendar-indicator {getPriorityColor(todo.priority)}"></div>
              {/each}
              {#if dayTodos.length > 3}
                <div class="calendar-indicator bg-gray-400"></div>
              {/if}
            </div>
          {/if}
        </button>
      {/each}
    </div>

    {#if selectedDate}
      <div class="border-t border-gray-100 pt-6">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-sm font-semibold text-gray-900">
            {selectedDate.toLocaleDateString('id-ID', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </h4>
          <span class="text-xs text-gray-500">{selectedDateTodos.length} task</span>
        </div>

        <div class="space-y-4">
          {#each selectedDateTodos as todo}
            <div class="card-hover rounded-xl p-4">
              <div class="flex items-start space-x-3">
                <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span class="text-sm">{getCategoryIcon(todo.category)}</span>
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-2">
                    <div class="text-xs text-gray-500 capitalize">{todo.category.replace('_', ' ')}</div>
                    <button 
                      on:click={() => openEditModal(todo)}
                      class="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit task"
                    >
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" class="text-gray-400 hover:text-gray-600">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                      </svg>
                    </button>
                  </div>
                  <div class="font-medium text-gray-900 mb-2">{todo.title}</div>
                  
                  {#if todo.goal_note}
                    <div class="text-xs text-gray-600 mb-3 italic">{todo.goal_note}</div>
                  {/if}
                  
                  {#if todo.tasks.length > 0}
                    <div class="pt-3 border-t border-gray-100 mb-3">
                      <div class="text-xs font-medium text-gray-700 mb-2">Subtask</div>
                      <div class="space-y-3">
                        {#each todo.tasks as task, taskIndex}
                          <div class="task-item">
                            <button 
                              on:click={() => toggleTask(todo.id, taskIndex)}
                              class="task-checkbox {task.done ? 'checked' : 'unchecked'}"
                            >
                              {#if task.done}
                                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                </svg>
                              {/if}
                            </button>
                            
                            <div class="task-content">
                              <div class="flex items-center justify-between">
                                <div class="task-title {task.done ? 'completed' : ''}">
                                  {task.title}
                                </div>
                                {#if task.finance?.linked && task.finance?.price}
                                  <div class="text-sm font-semibold text-blue-600 ml-2">
                                    {formatCurrency(task.finance.price)}
                                  </div>
                                {/if}
                              </div>
                              <div class="task-meta">
                                {#if task.time}
                                  <span>🕐 {task.time}</span>
                                {/if}
                                {#if task.quantity && task.unit}
                                  <span>📊 {task.quantity} {task.unit}</span>
                                {/if}
                                {#if task.code}
                                  <span>🏷️ {task.code}</span>
                                {/if}
                              </div>
                              
                              {#if task.attachments && task.attachments.length > 0}
                                <div class="mt-2 space-y-2">
                                  <div class="flex flex-wrap gap-2">
                                    {#each task.attachments as attachment}
                                      {@const attachInfo = renderAttachment(attachment)}
                                      <button 
                                        class="attachment-button"
                                        on:click={() => {
                                          if (attachment.type === 'link') {
                                            handleEmbeddedClick(attachment);
                                          } else {
                                            // MODIFIKASI 1: Buka modal secara langsung untuk QR, Maps, Photo
                                            openAttachmentModal(attachment); 
                                          }
                                        }}
                                      >
                                        <span>{attachInfo.icon}</span>
                                        <span>{attachInfo.label}</span>
                                      </button>
                                    {/each}
                                  </div>
                                </div>
                              {/if}
                            </div>
                          </div>
                        {/each}
                      </div>

                      {#if hasTasksWithPrice(todo)}
                        <div class="mt-3 pt-3 border-t border-gray-200">
                          <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-2">
                              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" class="text-gray-500">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
                              </svg>
                              <span class="text-sm font-medium text-gray-700">Total Biaya:</span>
                            </div>
                            <div class="text-lg font-bold text-blue-600">
                              {formatCurrency(getTotalTaskPrice(todo))}
                            </div>
                          </div>
                        </div>
                      {/if}
                    </div>
                  {/if}

                  {#if todo.tasks.length > 0}
                    <div class="pt-3 border-t border-gray-100">
                      <div class="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>{getProgressPercentage(todo)}% Selesai</span>
                        <span>{getCompletedTasksCount(todo)}/{todo.tasks.length} task</span>
                      </div>
                      <div class="progress-bar">
                        <div class="progress-fill" style="width: {getProgressPercentage(todo)}%"></div>
                      </div>
                    </div>
                  {/if}
                </div>
                <div class="flex flex-col items-end space-y-2">
                  <div class="w-3 h-3 {getPriorityColor(todo.priority)} rounded-full"></div>
                </div>
              </div>
            </div>
          {/each}
          
          {#if selectedDateTodos.length === 0}
            <div class="text-center py-8 text-gray-500">
              <p class="text-sm">Tidak ada aktivitas pada hari ini</p>
            </div>
          {/if}
        </div>
      </div>
    {:else}
      <div class="border-t border-gray-100 pt-6">
        <div class="text-center py-8 text-gray-500">
          <p class="text-sm">Klik tanggal untuk melihat aktivitas</p>
        </div>
      </div>
    {/if}
  </div>

  <button 
    on:click={openAddModal}
    class="fab"
  >
    <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
    </svg>
  </button>
</div>

{#if showAttachmentModal && selectedAttachment}
  <div class="modal-overlay" on:click={closeAttachmentModal}>
    <div class="modal-content modal-mobile" on:click|stopPropagation>
      <div class="modal-header">
        <h3 class="text-lg font-semibold text-gray-900">
          {#if selectedAttachment.type === 'qr_code'}
            QR Code
          {:else if selectedAttachment.type === 'photo'}
            Photo
          {:else if selectedAttachment.type === 'maps'}
            Maps Location
          {:else if selectedAttachment.type === 'link'}
            Link
          {/if}
        </h3>
        <button 
          on:click={closeAttachmentModal}
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="text-gray-500">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
      <div class="modal-body flex flex-col items-center justify-center space-y-4">
        {#if selectedAttachment.type === 'qr_code'}
          <img 
            src={selectedAttachment.url} 
            alt="QR Code" 
            class="qr-zoom-image"
          />
          <p class="text-center text-sm text-gray-600">Scan QR code dengan kamera untuk mengakses</p>
        {:else if selectedAttachment.type === 'photo'}
          <img 
            src={selectedAttachment.url} 
            alt="Photo" 
            class="max-w-full h-auto max-h-[80vh] object-contain rounded-lg"
          />
        {:else if selectedAttachment.type === 'maps'}
          <div class="w-full h-64 border rounded-lg overflow-hidden bg-gray-100 relative">
            <iframe
              src={generateMapsEmbed(selectedAttachment.url)}
              class="maps-iframe"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="Google Maps"
            ></iframe>
          </div>
          <button on:click={() => handleEmbeddedClick(selectedAttachment)} class="btn-primary">
            Buka di Aplikasi Maps
          </button>
        {:else if selectedAttachment.type === 'link'}
          <a href={selectedAttachment.url} target="_blank" rel="noopener noreferrer" class="btn-primary text-center">
            Buka Link Eksternal
          </a>
          <p class="text-center text-sm text-gray-600 break-all">{selectedAttachment.url}</p>
        {/if}
      </div>
    </div>
  </div>
{/if}

{#if showAddModal}
  <AddTodoModal on:close={closeAddModal} />
{/if}

{#if showEditModal && editingTodo}
  <EditTodoModal todo={editingTodo} on:close={closeEditModal} />
{/if}