import { expect } from 'chai';
import { Ok, Err, Result, None } from "ts-results";
import { MemoryDatabase } from '../src/models/db';

// Test
describe('User register test', () => {
    it('tests that a user can successfully register', async () => {
        const db = new MemoryDatabase();
        const registerResult = await db.registerUser("0x1", "//Alice");
        expect(registerResult.ok).to.be.true;
        const userKeypair = db.getUser("0x1");
        expect(userKeypair.ok).to.be.true;
    })
});



describe('User exists test', () => {
    it('tests registration should fail if user already exists', async () => {
        const db = new MemoryDatabase();
        const registerResult = await db.registerUser("0x1", "//Alice");
        expect(registerResult.ok).to.be.true;
        const userKeypair = db.getUser("0x1");
        expect(userKeypair.ok).to.be.true;
        const registerResult2 = await db.registerUser("0x1", "//Alice");
        expect(registerResult2.err).to.be.true;
    })
});