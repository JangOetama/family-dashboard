<script lang="ts">
  import { todos } from '../stores/data';
  import { CheckCircle, Circle, Clock, DollarSign } from 'lucide-svelte';

  export let todo: any;
  export let compact = false;

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
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  $: completedTasks = todo.tasks.filter(task => task.done).length;
  $: totalTasks = todo.tasks.length;
  $: progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-100 {compact ? 'p-3' : 'p-4'} hover:shadow-md transition-shadow">
  <!-- Header -->
  <div class="flex items-start justify-between mb-3">
    <div class="flex-1">
      <h3 class="font-medium text-gray-900 {compact ? 'text-sm' : 'text-base'} mb-1">{todo.title}</h3>
      <div class="flex items-center space-x-2 mb-2">
        <div class="w-3 h-3 {getPriorityColor(todo.priority)} rounded-full"></div>
        <span class="text-xs text-gray-500">{todo.category}</span>
      </div>
    </div>
    
    {#if todo.budget}
      <div class="flex items-center text-xs text-gray-500">
        <DollarSign size={12} class="mr-1" />
        {formatCurrency(todo.budget)}
      </div>
    {/if}
  </div>

  <!-- Goal Note -->
  {#if todo.goal_note && !compact}
    <p class="text-sm text-gray-600 mb-3">{todo.goal_note}</p>
  {/if}

  <!-- Progress Bar -->
  <div class="mb-3">
    <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
      <span>Progress</span>
      <span>{completedTasks}/{totalTasks}</span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2">
      <div class="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300" style="width: {progress}%"></div>
    </div>
  </div>

  <!-- Tasks -->
  <div class="space-y-2">
    {#each todo.tasks.slice(0, compact ? 2 : todo.tasks.length) as task, index}
      <div class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
        <button 
          on:click={() => toggleTask(todo.id, index)}
          class="flex-shrink-0 transition-colors"
        >
          {#if task.done}
            <CheckCircle size={18} class="text-green-600" />
          {:else}
            <Circle size={18} class="text-gray-400 hover:text-gray-600" />
          {/if}
        </button>
        
        <div class="flex-1">
          <p class="text-sm {task.done ? 'line-through text-gray-500' : 'text-gray-900'}">
            {task.title}
          </p>
          
          <div class="flex items-center space-x-2 mt-1">
            {#if task.time}
              <span class="flex items-center text-xs text-gray-500">
                <Clock size={10} class="mr-1" />
                {task.time}
              </span>
            {/if}
            
            {#if task.quantity && task.unit}
              <span class="text-xs text-gray-500">
                {task.quantity} {task.unit}
              </span>
            {/if}
            
            {#if task.finance?.linked && task.finance?.price}
              <span class="text-xs text-indigo-600">
                {formatCurrency(task.finance.price)}
              </span>
            {/if}
          </div>
        </div>
      </div>
    {/each}
    
    {#if compact && todo.tasks.length > 2}
      <div class="text-xs text-gray-500 text-center py-1">
        +{todo.tasks.length - 2} tugas lainnya
      </div>
    {/if}
  </div>

  <!-- Tags -->
  {#if todo.tags.length > 0 && !compact}
    <div class="flex flex-wrap gap-1 mt-3">
      {#each todo.tags as tag}
        <span class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
          #{tag}
        </span>
      {/each}
    </div>
  {/if}
</div>