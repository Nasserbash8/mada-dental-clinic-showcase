'use client'
/**
 * BasicTableOne - patients table (abridged sample)
 * Client-side search (name or code) and pagination over the list the server page provides.
 */
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactPaginate from "react-paginate";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../table";
import Button from "../button/Button";

type Patient = { patientId: string; name: string; age: number; code: string; work: string };

const PER_PAGE = 15;

const BasicTableOne: React.FC<{ tabledata: Patient[] }> = ({ tabledata }) => {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [offset, setOffset] = useState(0);

  // Search runs on every keystroke, so the filter is memoised.
  const filtered = useMemo(() => {
    const q = term.toLowerCase();
    return tabledata.filter((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
  }, [term, tabledata]);

  const page = filtered.slice(offset, offset + PER_PAGE);

  async function remove(id: string) {
    if (!confirm("Delete this patient file? This cannot be undone.")) return; // destructive: always confirm
    const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 p-4 justify-between">
        <input
          className="h-11 rounded-lg border px-4 text-sm xl:w-[430px]"
          placeholder="Search by name or code..."
          value={term}
          onChange={(e) => { setTerm(e.target.value); setOffset(0); }} // back to page 1 on a new search
        />
        <Link href="/dashboard/patients/addPatients"><Button>Add Patient +</Button></Link>
      </div>

      <div className="rounded-2xl border px-4 pb-3 pt-4 overflow-x-auto">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableCell isHeader>Patient</TableCell>
              <TableCell isHeader>Code</TableCell>
              <TableCell isHeader>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {page.length ? (
              page.map((p) => (
                <TableRow key={p.patientId}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.code}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button className="px-3 py-1.5 text-xs" onClick={() => router.push(`/dashboard/profile/${p.patientId}`)}>Edit</Button>
                      <Button className="bg-red-700 px-3 py-1.5 text-xs" onClick={() => remove(p.patientId)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><td colSpan={3} className="text-center py-4 text-gray-500">No results found</td></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex justify-center">
        <ReactPaginate
          previousLabel="Previous"
          nextLabel="Next"
          pageCount={Math.ceil(filtered.length / PER_PAGE)}
          onPageChange={({ selected }) => setOffset(selected * PER_PAGE)}
          containerClassName="flex gap-2 items-center"
          activeClassName="bg-brand-500 text-white"
          disabledClassName="opacity-50"
        />
      </div>
    </>
  );
};

export default BasicTableOne;
