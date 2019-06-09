import { Request, Response } from "servie/dist/node";
import { retry } from "./index";

describe("popsicle retry", () => {
  const req = new Request("/");

  const done = () => {
    throw new TypeError("Unhandled request");
  };

  it("should succeed", async () => {
    const transport = async (_: Request) => new Response(null, { status: 200 });

    const send = retry(transport);
    const res = await send(req, done);

    expect(res.status).toEqual(200);
  });

  it("should succeed after retry", async () => {
    let i = 0

    const transport = async (_: Request) => {
      return new Response(null, { status: ++i === 2 ? 200 : 500 });
    }

    const send = retry(transport);
    const res = await send(req, done);

    expect(res.status).toEqual(200);
  });

  it("should fail after max retries", async () => {
    jest.setTimeout(10000);

    const transport = async (_: Request) => {
      return new Response(null, { status: 500 });
    }

    const send = retry(transport);
    const res = await send(req, done);

    expect(res.status).toEqual(500);
  });
});
