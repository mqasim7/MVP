import React, { useState } from 'react';
import Link from 'next/link';
import { Users, Plus, MoreVertical, Edit } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  department?: string;
  last_login?: string;
  created_at: string;
}

interface Props {
  users: User[];
  companyId: number;
  createUser: () => void;
}

const formatDateTime = (dateTimeString?: string) => {
  if (!dateTimeString) return 'Never';
  return new Date(dateTimeString).toLocaleDateString();
};

export default function CompanyUsersTable({ users, companyId, createUser }: Props) {
  const [userPage, setUserPage] = useState(1);
  const [userPageSize] = useState(5);
  const paginatedUsers = users.slice((userPage - 1) * userPageSize, userPage * userPageSize);
  const totalUserPages = Math.ceil(users.length / userPageSize);

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">Company Users ({users.length})</h2>
          <button 
            className="btn btn-primary btn-sm"
            onClick={createUser}
          >
            <Plus size={14} />
            Add User
          </button>
        </div>
        {paginatedUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div>
                        <div className="font-bold">{user.name}</div>
                        <div className="text-sm opacity-50">{user.email}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        user.role === 'admin' ? 'badge-primary' :
                        user.role === 'editor' ? 'badge-secondary' :
                        'badge-ghost'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.department || '-'}</td>
                    <td>
                      <div className={`badge ${
                        user.status === 'active' ? 'badge-success' : 
                        user.status === 'pending' ? 'badge-warning' : 'badge-ghost'
                      }`}>
                        {user.status}
                      </div>
                    </td>
                    <td className="text-sm">
                      {formatDateTime(user.last_login)}
                    </td>
                    <td>
                      <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                          <MoreVertical size={16} />
                        </div>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                          <li>
                            <Link href={`/admin/users/${user.id}/edit?companyId=${companyId}`}>
                              <Edit size={14} className="mr-2" /> Edit User
                            </Link>
                          </li>
                          <li><a className="text-error">Remove from Company</a></li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users size={48} className="mx-auto opacity-20 mb-4" />
            <h3 className="font-semibold mb-2">No users yet</h3>
            <p className="text-base-content/70 mb-4">
              Start by adding users to this company
            </p>
            <Link href={`/admin/users/new`} className="btn btn-primary">
              <Plus size={16} className="mr-2" />
              Add First User
            </Link>
          </div>
        )}
        {users.length > userPageSize && (
          <div className="flex flex-wrap justify-center items-center mt-4 gap-2 w-full sm:flex-row flex-col">
            <button className="btn btn-sm w-full sm:w-auto" onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1}>Previous</button>
            {Array.from({ length: totalUserPages }, (_, i) => (
              <button
                key={i}
                className={`btn btn-sm w-full sm:w-auto ${userPage === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setUserPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="btn btn-sm w-full sm:w-auto" onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))} disabled={userPage === totalUserPages}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
} 