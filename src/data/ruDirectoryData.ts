import directoryJson from './ruDirectoryData.json';

export interface RuContact {
  id: number;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  category: 'teacher' | 'officer' | 'staff' | 'emergency';
  unit: string;
}

export interface RuDirectoryFaculty {
  code: number;
  name: string;
  deptCodes: string[];
}

export interface RuDirectoryDept {
  code: number;
  name: string;
  type: string;
}

export interface RuDirectoryData {
  total: number;
  counts: {
    teacher: number;
    officer: number;
    staff: number;
    emergency: number;
  };
  faculties: RuDirectoryFaculty[];
  departments: RuDirectoryDept[];
  contacts: RuContact[];
}

export const RU_DIRECTORY_DATA = directoryJson as unknown as RuDirectoryData;

/** Fast search across 3,877 contacts */
export function searchRuDirectory(
  query: string,
  category: string = 'all',
  department: string = 'all',
  limit: number = 60
): RuContact[] {
  const cleanQ = query.trim().toLowerCase();
  const all = RU_DIRECTORY_DATA.contacts;

  const results: RuContact[] = [];

  for (let i = 0; i < all.length; i++) {
    const c = all[i];

    if (category !== 'all' && c.category !== category) {
      continue;
    }

    if (department !== 'all' && c.department !== department) {
      continue;
    }

    if (cleanQ) {
      const matchName = c.name.toLowerCase().includes(cleanQ);
      const matchDesig = c.designation.toLowerCase().includes(cleanQ);
      const matchDept = c.department.toLowerCase().includes(cleanQ);
      const matchPhone = c.phone.includes(cleanQ);
      const matchEmail = c.email.toLowerCase().includes(cleanQ);

      if (!matchName && !matchDesig && !matchDept && !matchPhone && !matchEmail) {
        continue;
      }
    }

    results.push(c);
    if (results.length >= limit) break;
  }

  return results;
}

/** Get all contacts for a specific department (e.g. 'Computer Science & Engineering') */
export function getContactsForDept(deptName: string): RuContact[] {
  const clean = deptName.toLowerCase();
  return RU_DIRECTORY_DATA.contacts.filter((c) => {
    const d = c.department.toLowerCase();
    return d === clean || d.includes(clean) || clean.includes(d);
  });
}

/** Get list of distinct department names sorted alphabetically */
export const RU_DIRECTORY_DEPT_NAMES: string[] = Array.from(
  new Set(RU_DIRECTORY_DATA.contacts.map((c) => c.department).filter(Boolean))
).sort();
