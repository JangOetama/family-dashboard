<script lang="ts">
  import { finance } from '../stores/data';

  let selectedMonth = new Date().toISOString().slice(0, 7);
  let selectedCategory = 'all';

  $: filteredFinance = $finance.filter(entry => {
    const entryMonth = entry.date.slice(0, 7);
    const matchesMonth = selectedMonth === 'all' || entryMonth === selectedMonth;
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    return matchesMonth && matchesCategory;
  });

  $: monthlyIncome = filteredFinance
    .filter(entry => entry.type === 'in')
    .reduce((sum, entry) => sum + entry.amount, 0);

  $: monthlyExpenses = filteredFinance
    .filter(entry => entry.type === 'out')
    .reduce((sum, entry) => sum + entry.amount, 0);

  $: balance = monthlyIncome - monthlyExpenses;

  $: categories = [...new Set($finance.map(entry => entry.category))];

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  function getCategoryColor(category: string): string {
    const colors = {
      'gaji': 'badge-success',
      'tagihan': 'badge-danger',
      'kebutuhan': 'badge-primary',
      'transportasi': 'badge-warning',
      'kesehatan': 'badge-gray',
      'hiburan': 'badge-gray'
    };
    return colors[category] || 'badge-gray';
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="text-center py-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Keuangan Keluarga</h1>
    <p class="text-gray-600">Kelola pemasukan dan pengeluaran keluarga</p>
  </div>

  <!-- Filters -->
  <div class="card rounded-2xl p-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="form-group">
        <label for="month" class="form-label">Bulan</label>
        <select 
          id="month"
          bind:value={selectedMonth}
          class="form-select"
        >
          <option value="all">Semua Bulan</option>
          <option value="2025-01">Januari 2025</option>
          <option value="2024-12">Desember 2024</option>
          <option value="2024-11">November 2024</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="category" class="form-label">Kategori</label>
        <select 
          id="category"
          bind:value={selectedCategory}
          class="form-select"
        >
          <option value="all">Semua Kategori</option>
          {#each categories as category}
            <option value={category}>{category}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>

  <!-- Summary Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="stats-card">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600 mb-1">Pemasukan</p>
          <p class="text-2xl font-bold text-green-600">{formatCurrency(monthlyIncome)}</p>
        </div>
        <div class="stats-icon bg-green-100">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" class="text-green-600">
            <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>
    </div>

    <div class="stats-card">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600 mb-1">Pengeluaran</p>
          <p class="text-2xl font-bold text-red-600">{formatCurrency(monthlyExpenses)}</p>
        </div>
        <div class="stats-icon bg-red-100">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" class="text-red-600">
            <path fill-rule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>
    </div>

    <div class="stats-card">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600 mb-1">Saldo</p>
          <p class="text-2xl font-bold {balance >= 0 ? 'text-green-600' : 'text-red-600'}">
            {formatCurrency(balance)}
          </p>
        </div>
        <div class="stats-icon bg-blue-100">
          <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor" class="text-blue-600">
            <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>
    </div>
  </div>

  <!-- Transaction List -->
  <div class="card rounded-2xl">
    <div class="p-4 border-b border-gray-100">
      <h3 class="text-lg font-semibold text-gray-900">Riwayat Transaksi</h3>
    </div>
    
    <div class="divide-y divide-gray-100">
      {#each filteredFinance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) as entry}
        <div class="p-4 hover:bg-gray-50 transition-colors">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <div class="flex-shrink-0">
                  {#if entry.type === 'in'}
                    <div class="stats-icon bg-green-100">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="text-green-600">
                        <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                  {:else}
                    <div class="stats-icon bg-red-100">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="text-red-600">
                        <path fill-rule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                  {/if}
                </div>
                
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">{entry.title}</h4>
                  <div class="flex items-center space-x-2 mt-1">
                    <span class="badge {getCategoryColor(entry.category)}">
                      {entry.category}
                    </span>
                    <span class="text-sm text-gray-500">{formatDate(entry.date)}</span>
                  </div>
                </div>
              </div>
              
              {#if entry.description}
                <p class="text-sm text-gray-600 ml-13">{entry.description}</p>
              {/if}
            </div>
            
            <div class="text-right">
              <p class="text-lg font-semibold {entry.type === 'in' ? 'text-green-600' : 'text-red-600'}">
                {entry.type === 'in' ? '+' : '-'}{formatCurrency(entry.amount)}
              </p>
            </div>
          </div>
        </div>
      {/each}
      
      {#if filteredFinance.length === 0}
        <div class="p-8 text-center text-gray-500">
          <p>Tidak ada transaksi ditemukan</p>
        </div>
      {/if}
    </div>
  </div>
</div>