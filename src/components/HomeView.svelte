<script lang="ts">
  import { todos, finance } from '../stores/data';

  $: totalTasks = $todos.reduce((sum, todo) => sum + todo.tasks.length, 0);
  $: completedTasks = $todos.reduce((sum, todo) => sum + todo.tasks.filter(task => task.done).length, 0);
  $: pendingTasks = totalTasks - completedTasks;
  $: progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  $: thisMonthIncome = $finance.filter(entry => 
    entry.type === 'in' && 
    new Date(entry.date).getMonth() === new Date().getMonth()
  ).reduce((sum, entry) => sum + entry.amount, 0);
  
  $: thisMonthExpenses = $finance.filter(entry => 
    entry.type === 'out' && 
    new Date(entry.date).getMonth() === new Date().getMonth()
  ).reduce((sum, entry) => sum + entry.amount, 0);

  $: upcomingTodos = $todos.filter(todo => {
    const today = new Date();
    const todoDate = new Date(todo.schedule.repeat.start_date);
    return todoDate >= today || todo.tasks.some(task => !task.done);
  }).slice(0, 4);

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
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

  // Progress ring calculation
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  $: strokeDashoffset = circumference - (progressPercentage / 100) * circumference;
</script>

<div class="space-y-6">
  <!-- Welcome Section -->
  <div class="text-center py-4">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Selamat Datang</h1>
    <p class="text-gray-600">Kelola aktivitas dan keuangan keluarga Anda</p>
  </div>

  <!-- Progress Task Card -->
  <div class="card rounded-2xl p-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-6">Progress Task Anda</h2>
    
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <div class="space-y-4 mb-6">
          {#each upcomingTodos.slice(0, 4) as todo}
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 {getPriorityColor(todo.priority)} rounded-full"></div>
              <span class="text-sm text-gray-700 flex-1">{todo.title}</span>
            </div>
          {/each}
        </div>
        
        <div>
          <div class="text-3xl font-bold text-gray-900 mb-1">{totalTasks}</div>
          <div class="text-sm font-medium text-gray-700 mb-1">Total Task</div>
          <div class="text-xs text-gray-500">{completedTasks} dari {totalTasks} task selesai</div>
        </div>
      </div>
      
      <div class="relative w-24 h-24 ml-6">
        <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="{radius}"
            stroke="#e5e7eb"
            stroke-width="8"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="{radius}"
            stroke="#3b82f6"
            stroke-width="8"
            fill="none"
            stroke-linecap="round"
            stroke-dasharray="{circumference}"
            stroke-dashoffset="{strokeDashoffset}"
            class="transition-all duration-500"
          />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-lg font-bold text-gray-900">{progressPercentage}%</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Quick Stats -->
  <div class="grid grid-cols-2 gap-4">
    <div class="stats-card">
      <div class="flex items-center space-x-3">
        <div class="stats-icon bg-green-100">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="text-green-600">
            <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-1">Pemasukan</p>
          <p class="text-sm font-semibold text-gray-900">{formatCurrency(thisMonthIncome)}</p>
        </div>
      </div>
    </div>

    <div class="stats-card">
      <div class="flex items-center space-x-3">
        <div class="stats-icon bg-red-100">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="text-red-600">
            <path fill-rule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div>
          <p class="text-xs text-gray-500 mb-1">Pengeluaran</p>
          <p class="text-sm font-semibold text-gray-900">{formatCurrency(thisMonthExpenses)}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Recent Activity -->
  <div class="card rounded-2xl p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h3>
    <div class="space-y-3">
      {#each upcomingTodos.slice(0, 3) as todo}
        <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <span class="text-sm">{getCategoryIcon(todo.category)}</span>
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900">{todo.title}</p>
            <p class="text-xs text-gray-500 capitalize">{todo.category.replace('_', ' ')}</p>
          </div>
          <div class="w-3 h-3 {getPriorityColor(todo.priority)} rounded-full"></div>
        </div>
      {/each}
      
      {#if upcomingTodos.length === 0}
        <div class="text-center py-8 text-gray-500">
          <p class="text-sm">Belum ada aktivitas</p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Floating Add Button -->
  <button class="fab">
    <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
    </svg>
  </button>
</div>