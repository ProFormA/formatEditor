package reverse_task;

import static org.junit.Assert.*;

import org.junit.Test;

public class MyStringTest {

	@Test
	public void testOddNumberOfCharacters() {
		assertEquals("ollah", MyString.flip("hallo"));
	}

	@Test
	public void testEvenNumberOfCharacters() {
		assertEquals("4321", MyString.flip("1234"));
	}
	
	
	@Test
	public void testEmptyString() {
		assertEquals("", MyString.flip(""));
	}

}
