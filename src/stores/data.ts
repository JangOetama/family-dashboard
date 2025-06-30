import { writable } from 'svelte/store';

export interface Task {
  title: string;
  done: boolean;
  time?: string;
  quantity?: number;
  unit?: string;
  code?: string;
  finance?: {
    linked: boolean;
    type: "in" | "out" | "aset";
    price: number;
  };
  attachments?: Array<{
    type: "qr_code" | "maps" | "link" | "photo";
    url: string;
  }>;
}

export interface TodoItem {
  id: string;
  title: string;
  category: string;
  priority: "low" | "medium" | "high";
  budget?: number;
  schedule: {
    repeat: {
      type: "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom";
      interval?: number;
      days_of_week?: number[];
      dates_of_month?: number[];
      months_of_year?: number[];
      custom_dates?: string[];
      start_date: string;
      end_date?: string;
      except_dates?: string[];
    };
    alert: {
      type: "on_time" | "before" | "before_expired";
      value: string;
    };
  };
  goal_note: string;
  tasks: Task[];
  notes: string;
  tags: string[];
  notify_to: string[];
  visibility: "private" | "shared";
  created_at: Date;
  updated_at: Date;
}

export interface FinanceEntry {
  id: string;
  title: string;
  type: "in" | "out";
  amount: number;
  category: string;
  date: string;
  description?: string;
  linked_task_id?: string;
}

// Sample data
const sampleTodos: TodoItem[] = [
  {
    id: '1',
    title: 'Bayar Tagihan Listrik',
    category: 'rumah_tangga',
    priority: 'high',
    budget: 350000,
    schedule: {
      repeat: {
        type: 'monthly',
        dates_of_month: [25],
        start_date: '2025-01-01'
      },
      alert: {
        type: 'before',
        value: '3d'
      }
    },
    goal_note: 'Bayar sebelum tanggal jatuh tempo',
    tasks: [
      {
        title: 'Cek meteran listrik',
        done: false,
        code: 'PLN001',
        finance: {
          linked: true,
          type: 'out',
          price: 350000
        },
        attachments: [
          {
            type: 'qr_code',
            url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PLN001'
          }
        ]
      }
    ],
    notes: 'Jangan lupa catat nomor meteran',
    tags: ['tagihan', 'bulanan'],
    notify_to: ['ayah'],
    visibility: 'shared',
    created_at: new Date('2025-01-15'),
    updated_at: new Date('2025-01-15')
  },
  {
    id: '2',
    title: 'Olahraga Pagi',
    category: 'kesehatan',
    priority: 'medium',
    schedule: {
      repeat: {
        type: 'weekly',
        days_of_week: [1, 3, 5],
        start_date: '2025-01-20'
      },
      alert: {
        type: 'before',
        value: '30m'
      }
    },
    goal_note: 'Minimal 30 menit setiap sesi',
    tasks: [
      {
        title: 'Jogging 30 menit',
        done: true,
        time: '06:00',
        attachments: [
          {
            type: 'maps',
            url: 'Taman Suropati Jakarta'
          }
        ]
      },
      {
        title: 'Pemanasan 10 menit',
        done: true,
        time: '05:50'
      }
    ],
    notes: 'Jangan lupa minum air putih',
    tags: ['kesehatan', 'rutin'],
    notify_to: ['ibu', 'ayah'],
    visibility: 'shared',
    created_at: new Date('2025-01-10'),
    updated_at: new Date('2025-01-20')
  },
  {
    id: '3',
    title: 'Belanja Bulanan',
    category: 'keluarga',
    priority: 'high',
    budget: 1500000,
    schedule: {
      repeat: {
        type: 'monthly',
        dates_of_month: [1],
        start_date: '2025-01-01'
      },
      alert: {
        type: 'before',
        value: '1d'
      }
    },
    goal_note: 'Belanja kebutuhan sehari-hari untuk sebulan',
    tasks: [
      {
        title: 'Beras 10kg',
        done: false,
        quantity: 10,
        unit: 'kg',
        code: 'BRS001',
        finance: {
          linked: true,
          type: 'out',
          price: 150000
        },
        attachments: [
          {
            type: 'link',
            url: 'https://www.tokopedia.com/beras-premium'
          }
        ]
      },
      {
        title: 'Minyak goreng 2L',
        done: true,
        quantity: 2,
        unit: 'L',
        finance: {
          linked: true,
          type: 'out',
          price: 35000
        }
      }
    ],
    notes: 'Cek stok di rumah dulu sebelum belanja',
    tags: ['belanja', 'bulanan', 'kebutuhan'],
    notify_to: ['ibu'],
    visibility: 'shared',
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-20')
  },
  {
    id: '4',
    title: 'Ulang Tahun Pernikahan',
    category: 'keluarga',
    priority: 'high',
    budget: 2000000,
    schedule: {
      repeat: {
        type: 'yearly',
        start_date: '2025-06-15'
      },
      alert: {
        type: 'before',
        value: '1w'
      }
    },
    goal_note: 'Rayakan anniversary pernikahan setiap tahun',
    tasks: [
      {
        title: 'Booking restaurant',
        done: false,
        time: '19:00',
        finance: {
          linked: true,
          type: 'out',
          price: 1500000
        }
      },
      {
        title: 'Beli bunga',
        done: false,
        finance: {
          linked: true,
          type: 'out',
          price: 500000
        }
      }
    ],
    notes: 'Jangan lupa foto bersama',
    tags: ['anniversary', 'tahunan', 'romantis'],
    notify_to: ['ibu', 'ayah'],
    visibility: 'shared',
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01')
  }
];

const sampleFinance: FinanceEntry[] = [
  {
    id: '1',
    title: 'Gaji Bulanan',
    type: 'in',
    amount: 8000000,
    category: 'gaji',
    date: '2025-01-01',
    description: 'Gaji bulan Januari'
  },
  {
    id: '2',
    title: 'Minyak goreng 2L',
    type: 'out',
    amount: 35000,
    category: 'kebutuhan',
    date: '2025-01-20',
    linked_task_id: '3'
  },
  {
    id: '3',
    title: 'Tagihan Listrik',
    type: 'out',
    amount: 320000,
    category: 'tagihan',
    date: '2025-01-18'
  }
];

export const todos = writable<TodoItem[]>(sampleTodos);
export const finance = writable<FinanceEntry[]>(sampleFinance);
export const currentView = writable<'home' | 'calendar' | 'finance'>('home');