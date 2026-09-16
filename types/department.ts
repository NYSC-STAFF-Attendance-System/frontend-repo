/**
 * A department within an office.
 *
 * Modelled as its own entity rather than a plain string because attendance is
 * filtered and reported by department on the admin side. Staff screens only
 * ever display the name, but they carry the id so a record read here matches a
 * record filtered there.
 */
export type Department = {
  id: string;
  name: string;
};
