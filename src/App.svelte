<script lang="ts">
  import { currentView } from './stores/data';
  import Navigation from './components/Navigation.svelte';
  import HomeView from './components/HomeView.svelte';
  import CalendarView from './components/CalendarView.svelte';
  import FinanceView from './components/FinanceView.svelte';
</script>

<main class="min-h-screen bg-gray-50">
  <div class="max-w-md mx-auto md:max-w-7xl">
    <!-- Mobile Container -->
    <div class="md:hidden min-h-screen">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200 px-6 pt-12 pb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span class="text-lg font-bold text-white">D</span>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">Dashboard</h1>
              <p class="text-sm text-gray-500">Family Task Manager</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button class="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5-5-5h5v-12"></path>
              </svg>
            </button>
            <button class="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="px-6 pb-24 pt-6">
        {#if $currentView === 'home'}
          <HomeView />
        {:else if $currentView === 'calendar'}
          <CalendarView />
        {:else if $currentView === 'finance'}
          <FinanceView />
        {/if}
      </div>

      <!-- Mobile Navigation -->
      <Navigation activeView={$currentView} />
    </div>

    <!-- Desktop Layout -->
    <div class="hidden md:block">
      <div class="flex min-h-screen">
        <!-- Sidebar Navigation -->
        <div class="w-64 bg-white border-r border-gray-200 p-6">
          <div class="flex items-center space-x-3 mb-8">
            <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span class="text-lg font-bold text-white">D</span>
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-900">Dashboard</h1>
              <p class="text-sm text-gray-500">Family Manager</p>
            </div>
          </div>
          <Navigation activeView={$currentView} />
        </div>
        
        <!-- Main Content -->
        <div class="flex-1 p-6">
          {#if $currentView === 'home'}
            <HomeView />
          {:else if $currentView === 'calendar'}
            <CalendarView />
          {:else if $currentView === 'finance'}
            <FinanceView />
          {/if}
        </div>
      </div>
    </div>
  </div>
</main>