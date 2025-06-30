<script lang="ts">
  import { currentView } from '../stores/data';

  function setView(view: 'home' | 'calendar' | 'finance') {
    currentView.set(view);
  }

  export let activeView: string;
</script>

<!-- Mobile Navigation -->
<nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-50">
  <div class="flex justify-around items-center max-w-sm mx-auto">
    <button 
      class="flex flex-col items-center space-y-1 px-3 py-2 text-gray-500 hover:text-blue-600 transition-colors {activeView === 'home' ? 'text-blue-600' : ''}"
      on:click={() => setView('home')}
    >
      <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
      </svg>
      <span class="text-xs font-medium">Home</span>
    </button>
    
    <button 
      class="flex flex-col items-center space-y-1 px-3 py-2 text-gray-500 hover:text-blue-600 transition-colors {activeView === 'calendar' ? 'text-blue-600' : ''}"
      on:click={() => setView('calendar')}
    >
      <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
      </svg>
      <span class="text-xs font-medium">Calendar</span>
    </button>
    
    <button 
      class="flex flex-col items-center space-y-1 px-3 py-2 text-gray-500 hover:text-blue-600 transition-colors {activeView === 'finance' ? 'text-blue-600' : ''}"
      on:click={() => setView('finance')}
    >
      <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
      </svg>
      <span class="text-xs font-medium">Finance</span>
    </button>
  </div>
</nav>

<!-- Desktop Navigation -->
<nav class="hidden md:block">
  <div class="space-y-2">
    <button 
      class="nav-item w-full {activeView === 'home' ? 'active' : ''}"
      on:click={() => setView('home')}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
      </svg>
      <span>Home</span>
    </button>
    
    <button 
      class="nav-item w-full {activeView === 'calendar' ? 'active' : ''}"
      on:click={() => setView('calendar')}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
      </svg>
      <span>Calendar</span>
    </button>
    
    <button 
      class="nav-item w-full {activeView === 'finance' ? 'active' : ''}"
      on:click={() => setView('finance')}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/>
      </svg>
      <span>Finance</span>
    </button>
  </div>
</nav>